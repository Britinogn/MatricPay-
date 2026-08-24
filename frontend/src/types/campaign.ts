import type { AmountType, CampaignStatus, CampaignType } from "./enums";

export interface Campaign {
    id: string;
    organizerId: string;
    title: string;
    description: string | null;
    amount: string | number; // gross student-facing amount
    netAmount: string | number; // organizer net amount
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
    description?: string | null;
    // amount: number;
    netAmount: number; // changed from amount
    amountType?: AmountType;
    currency?: string;
    campaignType?: CampaignType;
    expiresAt?: string | null;
}

export interface OverviewCampaign {
  id: string;
  title: string;
  amount: number;
  netAmount: number;
  campaignType: string;
  status: string;
  slug: string;
  studentCount: number;
  paymentCount: number;
  createdAt: string;
}

export interface OrganizerOverview {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalStudents: number;
    totalCollected: number;
  };
  campaigns: OverviewCampaign[];
}

export interface UpdateCampaignStatusPayload {
  status: "active" | "closed"; // only forward transitions in Phase 1
}