import type {
    PaymentFailureReason,
    PaymentProvider,
    PaymentStatus,
} from "./enums";

export interface Payment {
    id: string;
    campaignId: string;
    studentId: string;
    amount: string;
    currency: string;
    provider: PaymentProvider;
    reference: string;
    providerTransactionId: string | null;
    status: PaymentStatus;
    failureReason: PaymentFailureReason | null;
    verifiedAt: string | null;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface InitiatePaymentPayload {
    slug: string;
    matricNumber: string;
}

export interface InitiatePaymentResponse {
    reference: string;
    authorizationUrl: string;
    accessCode?: string;
}

export interface PaymentStatusResponse {
    reference: string;
    status: PaymentStatus;
    amount: string;
    currency: string;
    studentName?: string;
    matricNumber?: string;
}