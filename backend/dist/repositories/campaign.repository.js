"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRepository = exports.CampaignRepository = void 0;
const prisma_1 = require("../lib/prisma");
class CampaignRepository {
    async create(data) {
        return prisma_1.prisma.campaign.create({ data });
    }
    async findById(id) {
        return prisma_1.prisma.campaign.findUnique({
            where: { id },
        });
    }
    async findByIdForOrganizer(id, organizerId) {
        return prisma_1.prisma.campaign.findFirst({
            where: {
                id,
                organizerId,
            },
        });
    }
    async findBySlug(slug) {
        return prisma_1.prisma.campaign.findUnique({
            where: { slug },
        });
    }
    async slugExists(slug) {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { slug },
            select: { id: true },
        });
        return Boolean(campaign);
    }
    async listByOrganizer(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
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
        const [campaigns, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.campaign.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.campaign.count({ where }),
        ]);
        return {
            campaigns,
            total,
            page,
            limit,
        };
    }
    async update(id, data) {
        return prisma_1.prisma.campaign.update({
            where: { id },
            data,
        });
    }
    async countStudents(campaignId) {
        return prisma_1.prisma.student.count({
            where: { campaignId },
        });
    }
    async countCompletedStudentImports(campaignId) {
        return prisma_1.prisma.studentImport.count({
            where: {
                campaignId,
                status: "completed",
            },
        });
    }
    async countPayments(campaignId) {
        return prisma_1.prisma.payment.count({ where: { campaignId } });
    }
    async deleteStudentsByCampaignId(campaignId) {
        await prisma_1.prisma.student.deleteMany({ where: { campaignId } });
    }
    async delete(id) {
        await prisma_1.prisma.campaign.delete({ where: { id } });
    }
    async findManyByIdsForOrganizer(ids, organizerId) {
        return prisma_1.prisma.campaign.findMany({
            where: {
                id: { in: ids },
                organizerId,
            },
        });
    }
    async bulkDelete(campaignIds) {
        await prisma_1.prisma.$transaction(async (tx) => {
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
exports.CampaignRepository = CampaignRepository;
exports.campaignRepository = new CampaignRepository();
//# sourceMappingURL=campaign.repository.js.map