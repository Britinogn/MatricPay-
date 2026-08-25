import type { CampaignStatus, UserRole, UserStatus } from "./enums";

export interface AdminDashboardMetrics {
  totalOrganizers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalStudents: number;
  successfulPaymentsCount: number;
  totalAmountCollected: number;
  flaggedPaymentsCount: number;
}

export interface AdminOrganizerRow {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  campaignsCount: number;
  totalCollected: number;
}

export interface AdminOrganizersResult {
  organizers: AdminOrganizerRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCampaignRow {
  id: string;
  title: string;
  status: CampaignStatus;
  campaignType: string;
  slug: string;
  isExpired: boolean;
  createdAt: string;
  organizer: {
    id: string;
    fullName: string;
    email: string;
  };
  totalStudents: number;
  totalPayments: number;
}

export interface AdminCampaignsResult {
  campaigns: AdminCampaignRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}