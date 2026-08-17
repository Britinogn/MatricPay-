import type { AmountType, CampaignStatus, CampaignType } from "./enums";

export interface Campaign {
    id: string;
    organizerId: string;
    title: string;
    description: string | null;
    amount: string; // Decimal comes as string from Prisma/JSON
    amountType: AmountType;
    currency: string;
    slug: string;
    paymentLink: string;
    campaignType: CampaignType;
    status: CampaignStatus;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    isExpired: boolean;
}

export interface CreateCampaignPayload {
    title: string;
    description?: string;
    amount: number;
    amountType?: AmountType;
    currency?: string;
    campaignType?: CampaignType;
    expiresAt?: string | null;
}

export interface UpdateCampaignStatusPayload {
  status: "active" | "closed"; // only forward transitions in Phase 1
}