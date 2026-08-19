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
    /**
     * Day-by-day cumulative "amount collected" for the Collection Progress
     * chart, computed directly from successful payments — not estimated or
     * interpolated. One point per UTC calendar day, from the campaign's
     * creation date through today.
     */
    async getCampaignCollectionTimeseries(user, campaignId) {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                _count: { select: { students: true } },
            },
        });
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        if (user.role !== client_1.UserRole.admin && campaign.organizerId !== user.id) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        const successfulPayments = await prisma_1.prisma.payment.findMany({
            where: { campaignId, status: client_1.PaymentStatus.successful },
            select: { amount: true, verifiedAt: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });
        const totalStudents = campaign._count.students;
        const campaignAmount = Number(campaign.amount);
        const totalCollected = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        // Same target logic as getCampaignDashboard's totalExpected, kept in
        // sync deliberately rather than re-derived a different way.
        const target = campaign.campaignType === client_1.CampaignType.restricted
            ? totalStudents * campaignAmount
            : totalCollected;
        const dayMs = 24 * 60 * 60 * 1000;
        const startDay = Date.UTC(campaign.createdAt.getUTCFullYear(), campaign.createdAt.getUTCMonth(), campaign.createdAt.getUTCDate());
        const now = new Date();
        const endDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const series = [];
        let runningTotal = 0;
        let paymentIndex = 0;
        for (let day = startDay; day <= endDay; day += dayMs) {
            const dayEnd = day + dayMs; // exclusive upper bound for "this day"
            while (paymentIndex < successfulPayments.length &&
                (successfulPayments[paymentIndex].verifiedAt ??
                    successfulPayments[paymentIndex].createdAt).getTime() < dayEnd) {
                runningTotal += Number(successfulPayments[paymentIndex].amount);
                paymentIndex += 1;
            }
            series.push({
                date: new Date(day).toISOString().slice(0, 10),
                cumulativeAmount: runningTotal,
            });
        }
        return { series, target };
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map