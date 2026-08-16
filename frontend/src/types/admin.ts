import type { User } from "./user";
// import type { Campaign } from "./campaign";

export interface AdminOrganizerRow extends User {
    campaignsCount?: number;
    totalCollected?: string;
}

export interface ForceCloseCampaignPayload {
    campaignId: string;
    reason?: string;
}