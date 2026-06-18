export const USER_ROLES = {
    ORGANIZER: "organizer",
    ADMIN: "admin",
} as const;

export const PAYMENT_STATUS = {
    PENDING: "pending",
    SUCCESSFUL: "successful",
    FAILED: "failed",
    CANCELLED: "cancelled",
} as const;

export const CAMPAIGN_STATUS = {
    DRAFT: "draft",
    ACTIVE: "active",
    CLOSED: "closed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;