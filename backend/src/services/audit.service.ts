import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http-error";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

function pageLimit(query: { page?: number; limit?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

export class AuditService {
  async listForOrganizer(
    organizerId: string,
    query: { page?: number; limit?: number } = {}
  ) {
    const { page, limit, skip } = pageLimit(query);

    const campaigns = await prisma.campaign.findMany({
      where: { organizerId },
      select: { id: true },
    });
    const campaignIds = campaigns.map((c) => c.id);

    const where = {
      OR: [
        { actorId: organizerId },
        campaignIds.length
          ? { entityType: "campaign", entityId: { in: campaignIds } }
          : { id: "__none__" },
      ],
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async listForAdmin(
    query: {
      page?: number;
      limit?: number;
      event?: string;
      search?: string;
    } = {}
  ) {
    const { page, limit, skip } = pageLimit(query);

    const where: Prisma.AuditLogWhereInput = {};

    if (query.event?.trim()) {
      where.event = query.event.trim();
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { event: { contains: search, mode: "insensitive" } },
        { entityType: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { actor: { fullName: { contains: search, mode: "insensitive" } } },
        { actor: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async listWebhooks(
    query: {
      page?: number;
      limit?: number;
      processed?: boolean;
      reference?: string;
    } = {}
  ) {
    const { page, limit, skip } = pageLimit(query);

    const where: Prisma.WebhookLogWhereInput = {};

    if (typeof query.processed === "boolean") {
      where.processed = query.processed;
    }

    if (query.reference?.trim()) {
      where.reference = {
        contains: query.reference.trim(),
        mode: "insensitive",
      };
    }

    const [total, logs] = await Promise.all([
      prisma.webhookLog.count({ where }),
      prisma.webhookLog.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          provider: true,
          eventType: true,
          reference: true,
          processed: true,
          attempts: true,
          lastError: true,
          receivedAt: true,
          processedAt: true,
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getWebhookById(id: string) {
    const log = await prisma.webhookLog.findUnique({ where: { id } });
    if (!log) {
      throw new HttpError(404, "Webhook log not found");
    }
    return { log };
  }
}

export const auditService = new AuditService();