import {
  PaymentFailureReason,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import { prisma } from "../lib/prisma";

export class PaymentRepository {
  async findPendingByCampaignAndStudent(campaignId: string, studentId: string) {
    return prisma.payment.findFirst({
      where: {
        campaignId,
        studentId,
        status: PaymentStatus.pending,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findSuccessfulByCampaignAndStudent(campaignId: string, studentId: string) {
    return prisma.payment.findFirst({
      where: {
        campaignId,
        studentId,
        status: PaymentStatus.successful,
      },
    });
  }

  async createPendingPayment(data: {
    campaignId: string;
    studentId: string;
    amount: number | Prisma.Decimal;
    currency?: string;
    reference: string;
    idempotencyKey: string;
    expiresAt: Date;
    provider?: PaymentProvider;
  }) {
    return prisma.payment.create({
      data: {
        campaignId: data.campaignId,
        studentId: data.studentId,
        amount: data.amount,
        currency: data.currency ?? "NGN",
        provider: data.provider ?? PaymentProvider.paystack,
        reference: data.reference,
        idempotencyKey: data.idempotencyKey,
        status: PaymentStatus.pending,
        expiresAt: data.expiresAt,
      },
    });
  }

  async createPaymentAttempt(data: {
    campaignId: string;
    studentId: string;
    amount: number | Prisma.Decimal;
    currency?: string;
    reference: string;
    idempotencyKey: string;
    expiresAt: Date;
    provider?: PaymentProvider;
  }) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await prisma.$transaction(
          async (transaction) => {
            const existingAttempt = await transaction.payment.findUnique({
              where: { idempotencyKey: data.idempotencyKey },
            });

            if (existingAttempt) {
              return { payment: existingAttempt, isDuplicateRequest: true };
            }

            const activeAttempt = await transaction.payment.findFirst({
              where: {
                campaignId: data.campaignId,
                studentId: data.studentId,
                status: PaymentStatus.pending,
              },
              orderBy: { createdAt: "desc" },
            });

            if (activeAttempt) {
              await transaction.payment.update({
                where: { id: activeAttempt.id },
                data: {
                  status: PaymentStatus.superseded,
                  failureReason: PaymentFailureReason.superseded_attempt,
                },
              });

              await transaction.auditLog.create({
                data: {
                  actorRole: UserRole.organizer,
                  event: "payment.superseded",
                  entityType: "payment",
                  entityId: activeAttempt.id,
                  metadata: {
                    reference: activeAttempt.reference,
                    replacementReference: data.reference,
                  },
                },
              });
            }

            const payment = await transaction.payment.create({
              data: {
                campaignId: data.campaignId,
                studentId: data.studentId,
                amount: data.amount,
                currency: data.currency ?? "NGN",
                provider: data.provider ?? PaymentProvider.paystack,
                reference: data.reference,
                idempotencyKey: data.idempotencyKey,
                status: PaymentStatus.pending,
                expiresAt: data.expiresAt,
              },
            });

            await transaction.auditLog.create({
              data: {
                actorRole: UserRole.organizer,
                event: "payment.initiated",
                entityType: "payment",
                entityId: payment.id,
                metadata: {
                  reference: payment.reference,
                  campaignId: payment.campaignId,
                  studentId: payment.studentId,
                  amount: payment.amount,
                  idempotencyKey: data.idempotencyKey,
                },
              },
            });

            return { payment, isDuplicateRequest: false };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < 2
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Payment attempt could not be created after transaction retries");
  }

  async saveCheckoutSession(
    paymentId: string,
    data: { authorizationUrl: string; accessCode: string }
  ) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        authorizationUrl: data.authorizationUrl,
        accessCode: data.accessCode,
      },
    });
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findUnique({
      where: { idempotencyKey },
    });
  }

  async findByReference(reference: string) {
    return prisma.payment.findUnique({
      where: { reference },
      include: {
        campaign: true,
        student: true,
      },
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: PaymentStatus;
      failureReason?: PaymentFailureReason | null;
      providerTransactionId?: string | null;
      verifiedAt?: Date | null;
    }
  ) {
    const updateData: Prisma.PaymentUpdateInput = {
      status: data.status,
    };

    if (data.failureReason !== undefined) {
      updateData.failureReason = data.failureReason;
    }

    if (data.providerTransactionId !== undefined) {
      updateData.providerTransactionId = data.providerTransactionId;
    }

    if (data.verifiedAt !== undefined) {
      updateData.verifiedAt = data.verifiedAt;
    }

    return prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  async createAuditLog(data: {
    actorId?: string | null;
    actorRole: UserRole;
    event: string;
    entityType: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string | null;
  }) {
    const createData: Prisma.AuditLogUncheckedCreateInput = {
      actorId: data.actorId ?? null,
      actorRole: data.actorRole,
      event: data.event,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ?? Prisma.DbNull,
      ipAddress: data.ipAddress ?? null,
    };

    return prisma.auditLog.create({
      data: createData,
    });
  }

  async createWebhookLog(data: {
    provider?: PaymentProvider;
    eventType: string;
    reference?: string | null;
    payload: Prisma.InputJsonValue;
    processed?: boolean;
    lastError?: string | null;
  }) {
    return prisma.webhookLog.create({
      data: {
        provider: data.provider ?? PaymentProvider.paystack,
        eventType: data.eventType,
        reference: data.reference ?? null,
        payload: data.payload,
        processed: data.processed ?? false,
        lastError: data.lastError ?? null,
      },
    });
  }

  async updateWebhookLog(
    id: string,
    data: {
      processed?: boolean;
      attempts?: number;
      lastError?: string | null;
      processedAt?: Date | null;
    }
  ) {
    const updateData: Prisma.WebhookLogUpdateInput = {};
    if (data.processed !== undefined) updateData.processed = data.processed;
    if (data.attempts !== undefined) updateData.attempts = data.attempts;
    if (data.lastError !== undefined) updateData.lastError = data.lastError;
    if (data.processedAt !== undefined) updateData.processedAt = data.processedAt;

    return prisma.webhookLog.update({
      where: { id },
      data: updateData,
    });
  }

  async listByCampaign({
    campaignId,
    status,
    search,
    page,
    limit,
  }: {
    campaignId: string;
    status?: PaymentStatus;
    search?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.PaymentWhereInput = {
      campaignId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            student: {
              OR: [
                {
                  fullName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  matricNumber: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          }
        : {}),
    };
  
    const skip = (page - 1) * limit;
  
    const orderBy =
      status === PaymentStatus.successful
        ? {
            student: {
              fullName: "asc" as const,
            },
          }
        : {
            createdAt: "desc" as const,
          };
  
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              matricNumber: true,
              email: true,
              phone: true,
              department: true,
              level: true,
            },
          },
        },
      }),
  
      prisma.payment.count({
        where,
      }),
    ]);
  
    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const paymentRepository = new PaymentRepository();
