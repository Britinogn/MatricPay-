import { CampaignStatus, PaymentStatus, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { paymentRepository } from "../repositories/payment.repository";
import { HttpError } from "../utils/http-error";

type AdminUser = {
  id: string;
  role: UserRole;
};

export class AdminService {
  async listOrganizers(query: { page?: number; limit?: number; search?: string; status?: UserStatus }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      role: UserRole.organizer,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [total, organizers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Aggregate funds per organizer
    const organizerIds = organizers.map((o) => o.id);
    const collections = await prisma.payment.groupBy({
      by: ["campaignId"],
      where: {
        status: PaymentStatus.successful,
        campaign: {
          organizerId: { in: organizerIds },
        },
      },
      _sum: {
        amount: true,
      },
    });

    const campaigns = await prisma.campaign.findMany({
      where: { organizerId: { in: organizerIds } },
      select: { id: true, organizerId: true },
    });

    const organizerFundsMap: Record<string, number> = {};
    for (const c of collections) {
      const camp = campaigns.find((item) => item.id === c.campaignId);
      if (camp) {
        organizerFundsMap[camp.organizerId] =
          (organizerFundsMap[camp.organizerId] || 0) + Number(c._sum.amount || 0);
      }
    }

    return {
      organizers: organizers.map((o) => ({
        id: o.id,
        fullName: o.fullName,
        email: o.email,
        role: o.role,
        status: o.status,
        createdAt: o.createdAt,
        campaignsCount: o._count.campaigns,
        totalCollected: organizerFundsMap[o.id] || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrganizerStatus(admin: AdminUser, organizerId: string, status: UserStatus) {
    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      throw new HttpError(404, "Organizer not found");
    }

    if (organizer.role === UserRole.admin) {
      throw new HttpError(400, "Cannot change status of another admin user");
    }

    const updated = await prisma.user.update({
      where: { id: organizerId },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await paymentRepository.createAuditLog({
      actorId: admin.id,
      actorRole: UserRole.admin,
      event: status === UserStatus.suspended ? "organizer.suspended" : "organizer.reactivated",
      entityType: "user",
      entityId: organizer.id,
      metadata: { previousStatus: organizer.status, newStatus: status },
    });

    return { organizer: updated };
  }

  async listCampaigns(query: { page?: number; limit?: number; search?: string; status?: CampaignStatus }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      campaigns: campaigns.map((c) => {
        const isExpired =
          c.status === CampaignStatus.active &&
          c.expiresAt !== null &&
          c.expiresAt.getTime() < Date.now();

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          amount: c.amount,
          amountType: c.amountType,
          currency: c.currency,
          slug: c.slug,
          paymentLink: c.paymentLink,
          campaignType: c.campaignType,
          status: c.status,
          expiresAt: c.expiresAt,
          isExpired,
          createdAt: c.createdAt,
          organizer: c.organizer,
          totalStudents: c._count.students,
          totalPayments: c._count.payments,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCampaignStatus(admin: AdminUser, campaignId: string, status: CampaignStatus) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    });

    await paymentRepository.createAuditLog({
      actorId: admin.id,
      actorRole: UserRole.admin,
      event: status === CampaignStatus.closed ? "campaign.force_closed" : `campaign.status_changed_${status}`,
      entityType: "campaign",
      entityId: campaign.id,
      metadata: { previousStatus: campaign.status, newStatus: status },
    });

    return { campaign: updated };
  }

  async getAdminDashboard() {
    const [totalOrganizers, totalCampaigns, activeCampaigns, totalStudents, paymentsSummary] =
      await Promise.all([
        prisma.user.count({ where: { role: UserRole.organizer } }),
        prisma.campaign.count(),
        prisma.campaign.count({ where: { status: CampaignStatus.active } }),
        prisma.student.count(),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.successful },
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]);

    const flaggedCount = await prisma.payment.count({
      where: { status: PaymentStatus.flagged },
    });

    return {
      metrics: {
        totalOrganizers,
        totalCampaigns,
        activeCampaigns,
        totalStudents,
        successfulPaymentsCount: paymentsSummary._count.id || 0,
        totalAmountCollected: Number(paymentsSummary._sum.amount || 0),
        flaggedPaymentsCount: flaggedCount,
      },
    };
  }
}

export const adminService = new AdminService();
