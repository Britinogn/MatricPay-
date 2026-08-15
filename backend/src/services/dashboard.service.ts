import { CampaignStatus, PaymentStatus, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http-error";

type AuthUser = {
  id: string;
  role: UserRole;
};

export class DashboardService {
  async getCampaignDashboard(user: AuthUser, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
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
      throw new HttpError(404, "Campaign not found");
    }

    if (user.role !== UserRole.admin && campaign.organizerId !== user.id) {
      throw new HttpError(404, "Campaign not found");
    }

    const isExpired =
      campaign.status === CampaignStatus.active &&
      campaign.expiresAt !== null &&
      campaign.expiresAt.getTime() < Date.now();

    // Student metrics
    const totalStudents = campaign._count.students;

    // Count distinct students with successful payment
    const paidStudentsResult = await prisma.payment.groupBy({
      by: ["studentId"],
      where: {
        campaignId,
        status: PaymentStatus.successful,
      },
    });
    const paidStudents = paidStudentsResult.length;
    const unpaidStudents = Math.max(0, totalStudents - paidStudents);

    // Payments status breakdown
    const paymentStatusCounts = await prisma.payment.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: {
        status: true,
      },
    });

    const statusMap: Record<string, number> = {
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
    const successfulPaymentsSum = await prisma.payment.aggregate({
      where: {
        campaignId,
        status: PaymentStatus.successful,
      },
      _sum: {
        amount: true,
      },
    });

    const totalCollected = Number(successfulPaymentsSum._sum.amount || 0);
    const campaignAmount = Number(campaign.amount);

    // Expected Amount
    const totalExpected =
      campaign.campaignType === "restricted"
        ? totalStudents * campaignAmount
        : totalCollected;

    const outstandingBalance = Math.max(0, totalExpected - totalCollected);
    const collectionPercentage =
      totalExpected > 0
        ? Math.min(100, Number(((totalCollected / totalExpected) * 100).toFixed(2)))
        : 100;

    // Recent Payments
    const recentPayments = await prisma.payment.findMany({
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
}

export const dashboardService = new DashboardService();
