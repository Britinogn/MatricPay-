import { prisma } from "../lib/prisma";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

export class AuditService {
  async listForOrganizer(
    organizerId: string,
    query: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

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
          actor: {
            select: { id: true, fullName: true, email: true },
          },
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
}

export const auditService = new AuditService();