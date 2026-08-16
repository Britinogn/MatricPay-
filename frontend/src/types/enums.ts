export type UserRole = "organizer" | "admin";
export type UserStatus = "active" | "suspended";

export type CampaignType = "restricted" | "open";
export type AmountType = "fixed" | "minimum";
export type CampaignStatus = "draft" | "active" | "closed";

export type PaymentStatus =
    | "pending"
    | "successful"
    | "failed"
    | "expired"
    | "flagged";

export type PaymentFailureReason =
    | "amount_mismatch"
    | "currency_mismatch"
    | "verification_failed"
    | "cancelled_by_user";

export type PaymentProvider = "paystack";

export type StudentImportMethod = "manual" | "csv" | "xlsx";
export type StudentImportStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed";