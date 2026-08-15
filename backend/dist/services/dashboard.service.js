"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const http_error_1 = require("../utils/http-error");
class DashboardService {
    async getCampaignDashboard(user, campaignId) {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                _count: {
                    select: {
                        students: true,
                        payments: true,
                    },
                },
            },
        });
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        if (user.role !== client_1.UserRole.admin && campaign.organizerId !== user.id) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        const isExpired = campaign.status === client_1.CampaignStatus.active &&
            campaign.expiresAt !== null &&
            campaign.expiresAt.getTime() < Date.now();
        // Student metrics
        const totalStudents = campaign._count.students;
        // Count distinct students with successful payment
        const paidStudentsResult = await prisma_1.prisma.payment.groupBy({
            by: ["studentId"],
            where: {
                campaignId,
                status: client_1.PaymentStatus.successful,
            },
        });
        const paidStudents = paidStudentsResult.length;
        const unpaidStudents = Math.max(0, totalStudents - paidStudents);
        // Payments status breakdown
        const paymentStatusCounts = await prisma_1.prisma.payment.groupBy({
            by: ["status"],
            where: { campaignId },
            _count: {
                status: true,
            },
        });
        const statusMap = {
            successful: 0,
            pending: 0,
            failed: 0,
            expired: 0,
            flagged: 0,
        };
        for (const group of paymentStatusCounts) {
            statusMap[group.status] = group._count.status;
        }
        // Collected Amount
        const successfulPaymentsSum = await prisma_1.prisma.payment.aggregate({
            where: {
                campaignId,
                status: client_1.PaymentStatus.successful,
            },
            _sum: {
                amount: true,
            },
        });
        const totalCollected = Number(successfulPaymentsSum._sum.amount || 0);
        const campaignAmount = Number(campaign.amount);
        // Expected Amount
        const totalExpected = campaign.campaignType === "restricted"
            ? totalStudents * campaignAmount
            : totalCollected;
        const outstandingBalance = Math.max(0, totalExpected - totalCollected);
        const collectionPercentage = totalExpected > 0
            ? Math.min(100, Number(((totalCollected / totalExpected) * 100).toFixed(2)))
            : 100;
        // Recent Payments
        const recentPayments = await prisma_1.prisma.payment.findMany({
            where: { campaignId },
            orderBy: { createdAt: "desc" },
            take: 15,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        matricNumber: true,
                        email: true,
                        department: true,
                    },
                },
            },
        });
        return {
            campaign: {
                id: campaign.id,
                title: campaign.title,
                description: campaign.description,
                amount: campaign.amount,
                amountType: campaign.amountType,
                currency: campaign.currency,
                slug: campaign.slug,
                paymentLink: campaign.paymentLink,
                campaignType: campaign.campaignType,
                status: campaign.status,
                expiresAt: campaign.expiresAt,
                isExpired,
            },
            metrics: {
                totalStudents,
                paidStudents,
                unpaidStudents,
                flaggedPayments: statusMap.flagged,
                totalExpected,
                totalCollected,
                outstandingBalance,
                collectionPercentage,
                statusBreakdown: statusMap,
            },
            recentPayments: recentPayments.map((p) => ({
                id: p.id,
                reference: p.reference,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                failureReason: p.failureReason,
                createdAt: p.createdAt,
                verifiedAt: p.verifiedAt,
                student: p.student,
            })),
        };
    }
    async getOrganizerOverview(user) {
        // Only organizers (or admins acting as organizers) can query personal overview
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: { organizerId: user.id },
            include: {
                _count: {
                    select: {
                        students: true,
                        payments: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter((c) => c.status === client_1.CampaignStatus.active).length;
        // Aggregate funds collected across all owned campaigns
        const successfulPaymentsSum = await prisma_1.prisma.payment.aggregate({
            where: {
                campaign: { organizerId: user.id },
                status: client_1.PaymentStatus.successful,
            },
            _sum: {
                amount: true,
            },
        });
        const totalCollected = Number(successfulPaymentsSum._sum.amount || 0);
        // Count total students across all owned campaigns
        const totalStudentsSum = campaigns.reduce((acc, c) => acc + c._count.students, 0);
        return {
            overview: {
                totalCampaigns,
                activeCampaigns,
                totalStudents: totalStudentsSum,
                totalCollected,
            },
            campaigns: campaigns.map((c) => ({
                id: c.id,
                title: c.title,
                amount: c.amount,
                campaignType: c.campaignType,
                status: c.status,
                slug: c.slug,
                studentCount: c._count.students,
                paymentCount: c._count.payments,
                createdAt: c.createdAt,
            })),
        };
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map