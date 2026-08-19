import type { Campaign, CampaignStatus, CampaignType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type CampaignListFilters = {
  organizerId: string;
  status?: CampaignStatus;
  campaignType?: CampaignType;
  search?: string;
  page?: number;
  limit?: number;
};

export type CampaignListResult = {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
};

export class CampaignRepository {
  async create(data: Prisma.CampaignUncheckedCreateInput): Promise<Campaign> {
    return prisma.campaign.create({ data });
  }

  async findById(id: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({
      where: { id },
    });
  }

  async findByIdForOrganizer(id: string, organizerId: string): Promise<Campaign | null> {
    return prisma.campaign.findFirst({
      where: {
        id,
        organizerId,
      },
    });
  }

  async findBySlug(slug: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({
      where: { slug },
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { id: true },
    });

    return Boolean(campaign);
  }

  async listByOrganizer(filters: CampaignListFilters): Promise<CampaignListResult> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      organizerId: filters.organizerId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.campaignType) {
      where.campaignType = filters.campaignType;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [campaigns, total] = await prisma.$transaction([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return {
      campaigns,
      total,
      page,
      limit,
    };
  }

  async update(id: string, data: Prisma.CampaignUncheckedUpdateInput): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async countStudents(campaignId: string): Promise<number> {
    return prisma.student.count({
      where: { campaignId },
    });
  }

  async countCompletedStudentImports(campaignId: string): Promise<number> {
    return prisma.studentImport.count({
      where: {
        campaignId,
        status: "completed",
      },
    });
  }

  async countPayments(campaignId: string): Promise<number> {
    return prisma.payment.count({ where: { campaignId } });
  }

  async deleteStudentsByCampaignId(campaignId: string): Promise<void> {
    await prisma.student.deleteMany({ where: { campaignId } });
  }

  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({ where: { id } });
  }

  async findManyByIdsForOrganizer(ids: string[], organizerId: string): Promise<Campaign[]> {
    return prisma.campaign.findMany({
      where: {
        id: { in: ids },
        organizerId,
      },
    });
  }
  
  async bulkDelete(campaignIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Delete associated students first (or rely on cascade delete)
      await tx.student.deleteMany({
        where: { campaignId: { in: campaignIds } },
      });
  
      // Delete student imports if needed (if not cascaded)
      await tx.studentImport.deleteMany({
        where: { campaignId: { in: campaignIds } },
      });
  
      // Delete payments? But we already verified no payments exist.
      // If you have a Payment model and want to be safe, you could delete them too,
      // but we'll skip because service checks paymentCount.
  
      // Finally delete campaigns
      await tx.campaign.deleteMany({
        where: { id: { in: campaignIds } },
      });
    });
  }

}

export const campaignRepository = new CampaignRepository();
