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
                status: client_1.PaymentStatus.pending,
                expiresAt: data.expiresAt,
            },
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
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
//# sourceMappingURL=payment.repository.js.map