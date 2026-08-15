"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const payment_repository_1 = require("../repositories/payment.repository");
const http_error_1 = require("../utils/http-error");
class AdminService {
    async listOrganizers(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            role: client_1.UserRole.organizer,
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
            prisma_1.prisma.user.count({ where }),
            prisma_1.prisma.user.findMany({
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
        const collections = await prisma_1.prisma.payment.groupBy({
            by: ["campaignId"],
            where: {
                status: client_1.PaymentStatus.successful,
                campaign: {
                    organizerId: { in: organizerIds },
                },
            },
            _sum: {
                amount: true,
            },
        });
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: { organizerId: { in: organizerIds } },
            select: { id: true, organizerId: true },
        });
        const organizerFundsMap = {};
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
    async updateOrganizerStatus(admin, organizerId, status) {
        const organizer = await prisma_1.prisma.user.findUnique({
            where: { id: organizerId },
        });
        if (!organizer) {
            throw new http_error_1.HttpError(404, "Organizer not found");
        }
        if (organizer.role === client_1.UserRole.admin) {
            throw new http_error_1.HttpError(400, "Cannot change status of another admin user");
        }
        const updated = await prisma_1.prisma.user.update({
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
        await payment_repository_1.paymentRepository.createAuditLog({
            actorId: admin.id,
            actorRole: client_1.UserRole.admin,
            event: status === client_1.UserStatus.suspended ? "organizer.suspended" : "organizer.reactivated",
            entityType: "user",
            entityId: organizer.id,
            metadata: { previousStatus: organizer.status, newStatus: status },
        });
        return { organizer: updated };
    }
    async listCampaigns(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
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
            prisma_1.prisma.campaign.count({ where }),
            prisma_1.prisma.campaign.findMany({
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
                const isExpired = c.status === client_1.CampaignStatus.active &&
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
    async updateCampaignStatus(admin, campaignId, status) {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        const updated = await prisma_1.prisma.campaign.update({
            where: { id: campaignId },
            data: { status },
        });
        await payment_repository_1.paymentRepository.createAuditLog({
            actorId: admin.id,
            actorRole: client_1.UserRole.admin,
            event: status === client_1.CampaignStatus.closed ? "campaign.force_closed" : `campaign.status_changed_${status}`,
            entityType: "campaign",
            entityId: campaign.id,
            metadata: { previousStatus: campaign.status, newStatus: status },
        });
        return { campaign: updated };
    }
    async getAdminDashboard() {
        const [totalOrganizers, totalCampaigns, activeCampaigns, totalStudents, paymentsSummary] = await Promise.all([
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.organizer } }),
            prisma_1.prisma.campaign.count(),
            prisma_1.prisma.campaign.count({ where: { status: client_1.CampaignStatus.active } }),
            prisma_1.prisma.student.count(),
            prisma_1.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.successful },
                _sum: { amount: true },
                _count: { id: true },
            }),
        ]);
        const flaggedCount = await prisma_1.prisma.payment.count({
            where: { status: client_1.PaymentStatus.flagged },
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
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map