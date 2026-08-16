"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const paystack_client_1 = require("../lib/paystack.client");
const prisma_1 = require("../lib/prisma");
const payment_repository_1 = require("../repositories/payment.repository");
const student_repository_1 = require("../repositories/student.repository");
const http_error_1 = require("../utils/http-error");
const matric_number_1 = require("../utils/matric-number");
const reference_1 = require("../utils/reference");
const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000; // 30 minutes
class PaymentService {
    async initiatePayment(input) {
        const campaign = await student_repository_1.studentRepository.findCampaignBySlug(input.slug);
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        const isExpired = campaign.expiresAt !== null && campaign.expiresAt.getTime() < Date.now();
        if (campaign.status !== client_1.CampaignStatus.active || isExpired) {
            throw new http_error_1.HttpError(400, "Campaign is not active or has expired");
        }
        const matricNumber = (0, matric_number_1.normalizeMatricNumber)(input.matricNumber);
        if (!matricNumber) {
            throw new http_error_1.HttpError(400, "Invalid matric number");
        }
        let student;
        let targetAmount;
        if (campaign.campaignType === client_1.CampaignType.restricted) {
            student = await student_repository_1.studentRepository.findByCampaignAndMatricNumber(campaign.id, matricNumber);
            if (!student) {
                throw new http_error_1.HttpError(404, "Student not found in restricted list for this campaign");
            }
            targetAmount = Number(campaign.amount);
        }
        else {
            // Open campaign
            if (campaign.amountType === "minimum") {
                if (input.amount === undefined || Number.isNaN(input.amount)) {
                    throw new http_error_1.HttpError(400, "Payment amount is required for minimum-amount campaigns");
                }
                const minAmount = Number(campaign.amount);
                if (input.amount < minAmount) {
                    throw new http_error_1.HttpError(400, `Payment amount must be at least ${campaign.currency} ${minAmount}`);
                }
                targetAmount = input.amount;
            }
            else {
                targetAmount = Number(campaign.amount);
            }
            const existingStudent = await student_repository_1.studentRepository.findByCampaignAndMatricNumber(campaign.id, matricNumber);
            if (existingStudent) {
                student = existingStudent;
            }
            else {
                if (!input.fullName || !input.fullName.trim()) {
                    throw new http_error_1.HttpError(400, "Full name is required for registration");
                }
                student = await prisma_1.prisma.student.create({
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
        const existingSuccess = await payment_repository_1.paymentRepository.findSuccessfulByCampaignAndStudent(campaign.id, student.id);
        if (existingSuccess) {
            throw new http_error_1.HttpError(400, "Payment has already been completed for this student");
        }
        // Check for an active, non-expired pending payment
        const existingPending = await payment_repository_1.paymentRepository.findPendingByCampaignAndStudent(campaign.id, student.id);
        let reference;
        let paymentRecord;
        if (existingPending && Number(existingPending.amount) === targetAmount) {
            reference = existingPending.reference;
            paymentRecord = existingPending;
        }
        else {
            reference = (0, reference_1.generatePaymentReference)();
            const expiresAt = new Date(Date.now() + PENDING_PAYMENT_TTL_MS);
            paymentRecord = await payment_repository_1.paymentRepository.createPendingPayment({
                campaignId: campaign.id,
                studentId: student.id,
                amount: targetAmount,
                currency: campaign.currency,
                reference,
                expiresAt,
            });
            await payment_repository_1.paymentRepository.createAuditLog({
                actorRole: client_1.UserRole.organizer,
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
        const amountInKobo = Math.round(targetAmount * 100);
        const callbackUrl = `${env_1.env.CLIENT_URL}/pay/${campaign.slug}/success?reference=${reference}`;
        // Fetch organizer to get subaccount code
        const organizer = await prisma_1.prisma.user.findUnique({
            where: { id: campaign.organizerId },
            select: { paystackSubaccountCode: true },
        });
        const initPayload = {
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
        };
        // Add subaccount settlement if organizer has one
        if (organizer?.paystackSubaccountCode) {
            initPayload.subaccount = organizer.paystackSubaccountCode;
            initPayload.bearer = "subaccount"; // Organizer bears Paystack's processing fee
            initPayload.transaction_charge = Math.round(amountInKobo * 0.02); // 2% platform fee
        }
        const paystackRes = await paystack_client_1.paystackClient.initializeTransaction(initPayload);
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
    async getPaymentStatus(reference) {
        const payment = await payment_repository_1.paymentRepository.findByReference(reference);
        if (!payment) {
            throw new http_error_1.HttpError(404, "Payment not found");
        }
        if (payment.status === client_1.PaymentStatus.pending) {
            try {
                const verifyData = await paystack_client_1.paystackClient.verifyTransaction(reference);
                if (verifyData.status === "success") {
                    const expectedKobo = Math.round(Number(payment.amount) * 100);
                    if (verifyData.amount < expectedKobo) {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.flagged,
                            failureReason: client_1.PaymentFailureReason.amount_mismatch,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: new Date(),
                        });
                        payment.status = client_1.PaymentStatus.flagged;
                        payment.failureReason = client_1.PaymentFailureReason.amount_mismatch;
                    }
                    else if (verifyData.currency.toUpperCase() !== payment.currency.toUpperCase()) {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.flagged,
                            failureReason: client_1.PaymentFailureReason.currency_mismatch,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: new Date(),
                        });
                        payment.status = client_1.PaymentStatus.flagged;
                        payment.failureReason = client_1.PaymentFailureReason.currency_mismatch;
                    }
                    else {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.successful,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: verifyData.paid_at ? new Date(verifyData.paid_at) : new Date(),
                        });
                        await payment_repository_1.paymentRepository.createAuditLog({
                            actorRole: client_1.UserRole.organizer,
                            event: "payment.completed",
                            entityType: "payment",
                            entityId: payment.id,
                            metadata: {
                                reference,
                                providerTransactionId: verifyData.id,
                                amount: payment.amount,
                            },
                        });
                        payment.status = client_1.PaymentStatus.successful;
                        payment.providerTransactionId = String(verifyData.id);
                        payment.verifiedAt = verifyData.paid_at ? new Date(verifyData.paid_at) : new Date();
                    }
                }
                else if (verifyData.status === "failed") {
                    await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                        status: client_1.PaymentStatus.failed,
                        failureReason: client_1.PaymentFailureReason.verification_failed,
                    });
                    payment.status = client_1.PaymentStatus.failed;
                    payment.failureReason = client_1.PaymentFailureReason.verification_failed;
                }
            }
            catch (err) {
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
    async handlePaystackWebhook(signature, rawBody, payload) {
        const isValid = paystack_client_1.paystackClient.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            throw new http_error_1.HttpError(401, "Invalid webhook signature");
        }
        const event = payload?.event;
        const reference = payload?.data?.reference;
        const webhookLog = await payment_repository_1.paymentRepository.createWebhookLog({
            provider: "paystack",
            eventType: event || "unknown",
            reference,
            payload,
        });
        if (event === "charge.success" && reference) {
            const payment = await payment_repository_1.paymentRepository.findByReference(reference);
            if (!payment) {
                await payment_repository_1.paymentRepository.updateWebhookLog(webhookLog.id, {
                    processed: false,
                    lastError: "Payment reference not found",
                });
                return { success: true, message: "Payment reference not found" };
            }
            // Idempotency check
            if (payment.status === client_1.PaymentStatus.successful ||
                payment.status === client_1.PaymentStatus.flagged) {
                await payment_repository_1.paymentRepository.updateWebhookLog(webhookLog.id, {
                    processed: true,
                    processedAt: new Date(),
                });
                return { success: true, message: "Payment already processed" };
            }
            // Perform direct API re-verification
            try {
                const verifyData = await paystack_client_1.paystackClient.verifyTransaction(reference);
                if (verifyData.status === "success") {
                    const expectedKobo = Math.round(Number(payment.amount) * 100);
                    if (verifyData.amount < expectedKobo) {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.flagged,
                            failureReason: client_1.PaymentFailureReason.amount_mismatch,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: new Date(),
                        });
                        await payment_repository_1.paymentRepository.createAuditLog({
                            actorRole: client_1.UserRole.organizer,
                            event: "payment.flagged",
                            entityType: "payment",
                            entityId: payment.id,
                            metadata: {
                                reason: "amount_mismatch",
                                expectedAmount: payment.amount,
                                receivedKobo: verifyData.amount,
                            },
                        });
                    }
                    else if (verifyData.currency.toUpperCase() !== payment.currency.toUpperCase()) {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.flagged,
                            failureReason: client_1.PaymentFailureReason.currency_mismatch,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: new Date(),
                        });
                        await payment_repository_1.paymentRepository.createAuditLog({
                            actorRole: client_1.UserRole.organizer,
                            event: "payment.flagged",
                            entityType: "payment",
                            entityId: payment.id,
                            metadata: {
                                reason: "currency_mismatch",
                                expectedCurrency: payment.currency,
                                receivedCurrency: verifyData.currency,
                            },
                        });
                    }
                    else {
                        await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                            status: client_1.PaymentStatus.successful,
                            providerTransactionId: String(verifyData.id),
                            verifiedAt: verifyData.paid_at ? new Date(verifyData.paid_at) : new Date(),
                        });
                        await payment_repository_1.paymentRepository.createAuditLog({
                            actorRole: client_1.UserRole.organizer,
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
                }
                else {
                    await payment_repository_1.paymentRepository.updateStatus(payment.id, {
                        status: client_1.PaymentStatus.failed,
                        failureReason: client_1.PaymentFailureReason.verification_failed,
                    });
                }
                await payment_repository_1.paymentRepository.updateWebhookLog(webhookLog.id, {
                    processed: true,
                    processedAt: new Date(),
                });
            }
            catch (error) {
                await payment_repository_1.paymentRepository.updateWebhookLog(webhookLog.id, {
                    processed: false,
                    lastError: error.message,
                });
                throw error;
            }
        }
        else {
            await payment_repository_1.paymentRepository.updateWebhookLog(webhookLog.id, {
                processed: true,
                processedAt: new Date(),
            });
        }
        return { success: true };
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map