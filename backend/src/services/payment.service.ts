import { CampaignStatus, CampaignType, PaymentFailureReason, PaymentStatus, UserRole } from "@prisma/client";
import { env } from "../config/env";
import { paystackClient } from "../lib/paystack.client";
import { prisma } from "../lib/prisma";
import { paymentRepository } from "../repositories/payment.repository";
import { studentRepository } from "../repositories/student.repository";
import { HttpError } from "../utils/http-error";
import { normalizeMatricNumber } from "../utils/matric-number";
import { generatePaymentReference } from "../utils/reference";
import type { InitiatePaymentInput } from "../validators/payment.validator";

const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class PaymentService {
  async initiatePayment(input: InitiatePaymentInput) {
    const campaign = await studentRepository.findCampaignBySlug(input.slug);

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    const isExpired =
      campaign.expiresAt !== null && campaign.expiresAt.getTime() < Date.now();

    if (campaign.status !== CampaignStatus.active || isExpired) {
      throw new HttpError(400, "Campaign is not active or has expired");
    }

    const matricNumber = normalizeMatricNumber(input.matricNumber);
    if (!matricNumber) {
      throw new HttpError(400, "Invalid matric number");
    }

    let student;
    let targetAmount: number;

    if (campaign.campaignType === CampaignType.restricted) {
      student = await studentRepository.findByCampaignAndMatricNumber(
        campaign.id,
        matricNumber
      );

      if (!student) {
        throw new HttpError(404, "Student not found in restricted list for this campaign");
      }

      targetAmount = Number(campaign.amount);
    } else {
      // Open campaign
      if (campaign.amountType === "minimum") {
        if (input.amount === undefined || Number.isNaN(input.amount)) {
          throw new HttpError(400, "Payment amount is required for minimum-amount campaigns");
        }

        const minAmount = Number(campaign.amount);
        if (input.amount < minAmount) {
          throw new HttpError(
            400,
            `Payment amount must be at least ${campaign.currency} ${minAmount}`
          );
        }

        targetAmount = input.amount;
      } else {
        targetAmount = Number(campaign.amount);
      }

      const existingStudent = await studentRepository.findByCampaignAndMatricNumber(
        campaign.id,
        matricNumber
      );

      if (existingStudent) {
        student = existingStudent;
      } else {
        if (!input.fullName || !input.fullName.trim()) {
          throw new HttpError(400, "Full name is required for registration");
        }

        student = await prisma.student.create({
          data: {
            campaignId: campaign.id,
            matricNumber,
            fullName: input.fullName.trim(),
            email: input.email?.trim().toLowerCase() || null,
            phone: input.phone?.trim() || null,
            department: input.department?.trim() || null,
            level: input.level?.trim() || null,
          },
        });
      }
    }

    // Check if student has already completed payment for this campaign
    const existingSuccess = await paymentRepository.findSuccessfulByCampaignAndStudent(
      campaign.id,
      student.id
    );

    if (existingSuccess) {
      throw new HttpError(400, "Payment has already been completed for this student");
    }

    // Check for an active, non-expired pending payment
    const existingPending = await paymentRepository.findPendingByCampaignAndStudent(
      campaign.id,
      student.id
    );

    let reference: string;
    let paymentRecord;

    if (existingPending && Number(existingPending.amount) === targetAmount) {
      reference = existingPending.reference;
      paymentRecord = existingPending;
    } else {
      reference = generatePaymentReference();
      const expiresAt = new Date(Date.now() + PENDING_PAYMENT_TTL_MS);

      paymentRecord = await paymentRepository.createPendingPayment({
        campaignId: campaign.id,
        studentId: student.id,
        amount: targetAmount,
        currency: campaign.currency,
        reference,
        expiresAt,
      });

      await paymentRepository.createAuditLog({
        actorRole: UserRole.organizer,
        event: "payment.initiated",
        entityType: "payment",
        entityId: paymentRecord.id,
        metadata: {
          reference,
          campaignId: campaign.id,
          studentId: student.id,
          amount: targetAmount,
        },
      });
    }

    // const amountInKobo = Math.round(targetAmount * 100);

    // targetAmount is a whole Naira amount (stored as campaign.amount)
    // So totalKobo is already whole kobo
    const totalKobo = Math.round(Number(targetAmount) * 100); // total customer pays
    const transactionChargeKobo = Math.ceil(totalKobo * 0.02); // 2% platform fee, rounded up
    const amountInKobo = totalKobo - transactionChargeKobo; // base amount for Paystack
    const callbackUrl = `${env.CLIENT_URL}/pay/${campaign.slug}/success?reference=${reference}`;

    // Fetch organizer to get subaccount code
    const organizer = await prisma.user.findUnique({
      where: { id: campaign.organizerId },
      select: { paystackSubaccountCode: true },
    });

    // This should be unreachable — campaign.service.ts's activation guard
    // already blocks activation without a linked payout account. Treating
    // this as a hard failure rather than silently omitting the subaccount
    // fields matters: without it, a bug or bypass upstream would result in
    // the FULL payment settling into MatricPay's own account with no split
    // at all, silently, instead of failing loudly right here.
    if (!organizer?.paystackSubaccountCode) {
      throw new HttpError(
        500,
        "Organizer has no linked payout account — payment cannot be initialized. This should have been blocked at campaign activation."
      );
    }

    const initPayload: any = {
      email: student.email || `student.${student.matricNumber.toLowerCase()}@matricpay.internal`,
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        campaignId: campaign.id,
        studentId: student.id,
        matricNumber: student.matricNumber,
        paymentId: paymentRecord.id,
      },
      subaccount: organizer.paystackSubaccountCode,
      bearer: "subaccount", // Organizer bears Paystack's processing fee
      // transaction_charge: Math.round(amountInKobo * 0.02), // 2% platform fee, flat kobo amount
      transaction_charge: transactionChargeKobo,
    };

    const paystackRes = await paystackClient.initializeTransaction(initPayload);
    return {
      authorizationUrl: paystackRes.authorization_url,
      accessCode: paystackRes.access_code,
      reference,
      amount: targetAmount,
      currency: campaign.currency,
      student: {
        id: student.id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
      },
    };
  }

  async getPaymentStatus(reference: string) {
    const payment = await paymentRepository.findByReference(reference);

    if (!payment) {
      throw new HttpError(404, "Payment not found");
    }

    if (payment.status === PaymentStatus.pending) {
      try {
        const verifyData = await paystackClient.verifyTransaction(reference);

        if (verifyData.status === "success") {
          // const expectedKobo = Math.round(Number(payment.amount) * 100);
          const expectedTotalKobo = Math.round(Number(payment.amount) * 100);

          // if (verifyData.amount < expectedKobo) 
          if (verifyData.amount !== expectedTotalKobo) {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.flagged,
              failureReason: PaymentFailureReason.amount_mismatch,
              providerTransactionId: String(verifyData.id),
              verifiedAt: new Date(),
            });

            payment.status = PaymentStatus.flagged;
            payment.failureReason = PaymentFailureReason.amount_mismatch;
          } else if (
            verifyData.currency.toUpperCase() !== payment.currency.toUpperCase()
          ) {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.flagged,
              failureReason: PaymentFailureReason.currency_mismatch,
              providerTransactionId: String(verifyData.id),
              verifiedAt: new Date(),
            });

            payment.status = PaymentStatus.flagged;
            payment.failureReason = PaymentFailureReason.currency_mismatch;
          } else {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.successful,
              providerTransactionId: String(verifyData.id),
              verifiedAt: verifyData.paid_at ? new Date(verifyData.paid_at) : new Date(),
            });

            await paymentRepository.createAuditLog({
              actorRole: UserRole.organizer,
              event: "payment.completed",
              entityType: "payment",
              entityId: payment.id,
              metadata: {
                reference,
                providerTransactionId: verifyData.id,
                amount: payment.amount,
              },
            });

            payment.status = PaymentStatus.successful;
            payment.providerTransactionId = String(verifyData.id);
            payment.verifiedAt = verifyData.paid_at ? new Date(verifyData.paid_at) : new Date();
          }
        } else if (verifyData.status === "failed") {
          await paymentRepository.updateStatus(payment.id, {
            status: PaymentStatus.failed,
            failureReason: PaymentFailureReason.verification_failed,
          });

          payment.status = PaymentStatus.failed;
          payment.failureReason = PaymentFailureReason.verification_failed;
        }
      } catch (err) {
        // If verification fails or throws, return current state
      }
    }

    return {
      reference: payment.reference,
      status: payment.status,
      failureReason: payment.failureReason,
      amount: payment.amount,
      currency: payment.currency,
      verifiedAt: payment.verifiedAt,
      campaign: {
        id: payment.campaign.id,
        title: payment.campaign.title,
        slug: payment.campaign.slug,
      },
      student: {
        id: payment.student.id,
        fullName: payment.student.fullName,
        matricNumber: payment.student.matricNumber,
      },
    };
  }

  async handlePaystackWebhook(
    signature: string,
    rawBody: Buffer | string,
    payload: any
  ) {
    const isValid = paystackClient.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new HttpError(401, "Invalid webhook signature");
    }

    const event = payload?.event;
    const reference = payload?.data?.reference;

    const webhookLog = await paymentRepository.createWebhookLog({
      provider: "paystack",
      eventType: event || "unknown",
      reference,
      payload,
    });

    if (event === "charge.success" && reference) {
      const payment = await paymentRepository.findByReference(reference);

      if (!payment) {
        await paymentRepository.updateWebhookLog(webhookLog.id, {
          processed: false,
          lastError: "Payment reference not found",
        });
        return { success: true, message: "Payment reference not found" };
      }

      // Idempotency check
      if (
        payment.status === PaymentStatus.successful ||
        payment.status === PaymentStatus.flagged
      ) {
        await paymentRepository.updateWebhookLog(webhookLog.id, {
          processed: true,
          processedAt: new Date(),
        });
        return { success: true, message: "Payment already processed" };
      }

      // Perform direct API re-verification
      try {
        const verifyData = await paystackClient.verifyTransaction(reference);

        if (verifyData.status === "success") {
          // const expectedKobo = Math.round(Number(payment.amount) * 100);
          const expectedTotalKobo = Math.round(Number(payment.amount) * 100);

          // if (verifyData.amount < expectedKobo) 
          if (verifyData.amount !== expectedTotalKobo) {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.flagged,
              failureReason: PaymentFailureReason.amount_mismatch,
              providerTransactionId: String(verifyData.id),
              verifiedAt: new Date(),
            });

            await paymentRepository.createAuditLog({
              actorRole: UserRole.organizer,
              event: "payment.flagged",
              entityType: "payment",
              entityId: payment.id,
              metadata: {
                reason: "amount_mismatch",
                expectedAmount: payment.amount,
                receivedKobo: verifyData.amount,
              },
            });
          } else if (
            verifyData.currency.toUpperCase() !== payment.currency.toUpperCase()
          ) {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.flagged,
              failureReason: PaymentFailureReason.currency_mismatch,
              providerTransactionId: String(verifyData.id),
              verifiedAt: new Date(),
            });

            await paymentRepository.createAuditLog({
              actorRole: UserRole.organizer,
              event: "payment.flagged",
              entityType: "payment",
              entityId: payment.id,
              metadata: {
                reason: "currency_mismatch",
                expectedCurrency: payment.currency,
                receivedCurrency: verifyData.currency,
              },
            });
          } else {
            await paymentRepository.updateStatus(payment.id, {
              status: PaymentStatus.successful,
              providerTransactionId: String(verifyData.id),
              verifiedAt: verifyData.paid_at ? new Date(verifyData.paid_at) : new Date(),
            });

            await paymentRepository.createAuditLog({
              actorRole: UserRole.organizer,
              event: "payment.completed",
              entityType: "payment",
              entityId: payment.id,
              metadata: {
                reference,
                providerTransactionId: verifyData.id,
                amount: payment.amount,
              },
            });
          }
        } else {
          await paymentRepository.updateStatus(payment.id, {
            status: PaymentStatus.failed,
            failureReason: PaymentFailureReason.verification_failed,
          });
        }

        await paymentRepository.updateWebhookLog(webhookLog.id, {
          processed: true,
          processedAt: new Date(),
        });
      } catch (error) {
        await paymentRepository.updateWebhookLog(webhookLog.id, {
          processed: false,
          lastError: (error as Error).message,
        });
        throw error;
      }
    } else {
      await paymentRepository.updateWebhookLog(webhookLog.id, {
        processed: true,
        processedAt: new Date(),
      });
    }

    return { success: true };
  }
}

export const paymentService = new PaymentService();
