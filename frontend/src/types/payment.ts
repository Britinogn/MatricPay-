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
    // student: string;
    // student?: {
    //     fullName: string;
    // };
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

//chatgpt

export interface CampaignPaymentStudent {
  id: string;
  fullName: string;
  matricNumber: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  level: string | null;
}

export interface CampaignPayment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  verifiedAt: string | null;
  student: CampaignPaymentStudent;
}

export interface CampaignPaymentsResult {
  payments: CampaignPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// export interface CampaignPaymentsResponse {
//   payments: CampaignPayment[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// }