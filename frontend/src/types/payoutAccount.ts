export interface PayoutAccount {
    paystackSubaccountCode: string | null;
    settlementBankCode: string | null;
    settlementAccountNumber: string | null;
    settlementAccountName: string | null;
    isVerified: boolean;
    verificationError: string | null;
}

export interface CreatePayoutAccountPayload {
    businessName: string;
    settlementBankCode: string;
    settlementAccountNumber: string;
    percentageCharge?: number; // usually 0 for full settlement
}