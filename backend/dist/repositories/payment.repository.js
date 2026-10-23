"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
class PaymentRepository {
    async findPendingByCampaignAndStudent(campaignId, studentId) {
        return prisma_1.prisma.payment.findFirst({
            where: {
                campaignId,
                studentId,
                status: client_1.PaymentStatus.pending,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findSuccessfulByCampaignAndStudent(campaignId, studentId) {
        return prisma_1.prisma.payment.findFirst({
            where: {
                campaignId,
                studentId,
                status: client_1.PaymentStatus.successful,
            },
        });
    }
    async createPendingPayment(data) {
        return prisma_1.prisma.payment.create({
            data: {
                campaignId: data.campaignId,
                studentId: data.studentId,
                amount: data.amount,
                currency: data.currency ?? "NGN",
                provider: data.provider ?? client_1.PaymentProvider.paystack,
                reference: data.reference,
                idempotencyKey: data.idempotencyKey,
                status: client_1.PaymentStatus.pending,
                expiresAt: data.expiresAt,
            },
        });
    }
    async createPaymentAttempt(data) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                return await prisma_1.prisma.$transaction(async (transaction) => {
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
                            status: client_1.PaymentStatus.pending,
                        },
                        orderBy: { createdAt: "desc" },
                    });
                    if (activeAttempt) {
                        await transaction.payment.update({
                            where: { id: activeAttempt.id },
                            data: {
                                status: client_1.PaymentStatus.superseded,
                                failureReason: client_1.PaymentFailureReason.superseded_attempt,
                            },
                        });
                        await transaction.auditLog.create({
                            data: {
                                actorRole: client_1.UserRole.organizer,
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
                            provider: data.provider ?? client_1.PaymentProvider.paystack,
                            reference: data.reference,
                            idempotencyKey: data.idempotencyKey,
                            status: client_1.PaymentStatus.pending,
                            expiresAt: data.expiresAt,
                        },
                    });
                    await transaction.auditLog.create({
                        data: {
                            actorRole: client_1.UserRole.organizer,
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
                }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2034" &&
                    attempt < 2) {
                    continue;
                }
                throw error;
            }
        }
        throw new Error("Payment attempt could not be created after transaction retries");
    }
    async saveCheckoutSession(paymentId, data) {
        return prisma_1.prisma.payment.update({
            where: { id: paymentId },
            data: {
                authorizationUrl: data.authorizationUrl,
                accessCode: data.accessCode,
            },
        });
    }
    async findByIdempotencyKey(idempotencyKey) {
        return prisma_1.prisma.payment.findUnique({
            where: { idempotencyKey },
        });
    }
    async findByReference(reference) {
        return prisma_1.prisma.payment.findUnique({
            where: { reference },
            include: {
                campaign: true,
                student: true,
            },
        });
    }
    async updateStatus(id, data) {
        const updateData = {
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
        return prisma_1.prisma.payment.update({
            where: { id },
            data: updateData,
        });
    }
    async createAuditLog(data) {
        const createData = {
            actorId: data.actorId ?? null,
            actorRole: data.actorRole,
            event: data.event,
            entityType: data.entityType,
            entityId: data.entityId,
            metadata: data.metadata ?? client_1.Prisma.DbNull,
            ipAddress: data.ipAddress ?? null,
        };
        return prisma_1.prisma.auditLog.create({
            data: createData,
        });
    }
    async createWebhookLog(data) {
        return prisma_1.prisma.webhookLog.create({
            data: {
                provider: data.provider ?? client_1.PaymentProvider.paystack,
                eventType: data.eventType,
                reference: data.reference ?? null,
                payload: data.payload,
                processed: data.processed ?? false,
                lastError: data.lastError ?? null,
            },
        });
    }
    async updateWebhookLog(id, data) {
        const updateData = {};
        if (data.processed !== undefined)
            updateData.processed = data.processed;
        if (data.attempts !== undefined)
            updateData.attempts = data.attempts;
        if (data.lastError !== undefined)
            updateData.lastError = data.lastError;
        if (data.processedAt !== undefined)
            updateData.processedAt = data.processedAt;
        return prisma_1.prisma.webhookLog.update({
            where: { id },
            data: updateData,
        });
    }
    async listByCampaign({ campaignId, status, search, page, limit, }) {
        const where = {
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
        const orderBy = status === client_1.PaymentStatus.successful
            ? {
                student: {
                    fullName: "asc",
                },
            }
            : {
                createdAt: "desc",
            };
        const [payments, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.payment.findMany({
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
            prisma_1.prisma.payment.count({
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
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
//# sourceMappingURL=payment.repository.js.map