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
        status: PaymentStatus.pending,
        expiresAt: data.expiresAt,
      },
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
}

export const paymentRepository = new PaymentRepository();
