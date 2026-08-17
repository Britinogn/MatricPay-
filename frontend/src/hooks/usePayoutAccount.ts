import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PayoutAccount } from "../types";

export function usePayoutAccount() {
  return useQuery({
    queryKey: ["payout-account"],
    queryFn: async () => {
      try {
        const res = await api.get("/organizer/payout-account");
        const payload = res.data.data ?? res.data;
        return (payload as PayoutAccount) ?? null;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        // No account set up yet
        if (status === 404) return null;
        throw err;
      }
    },
    retry: false,
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: async (payload: {
      accountNumber: string;
      bankCode: string;
    }) => {
      const res = await api.post("/organizer/payout-account/resolve", {
        bank_code: payload.bankCode,
        account_number: payload.accountNumber,
      });
      return res.data.data ?? res.data;
    },
  });
}

export function useCreatePayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      businessName: string;
      settlementBankCode: string;
      settlementAccountNumber: string;
      percentageCharge?: number;
    }) => {
      const res = await api.post("/organizer/payout-account", {
        business_name: payload.businessName,
        settlement_bank: payload.settlementBankCode,
        account_number: payload.settlementAccountNumber,
        percentage_charge: payload.percentageCharge ?? 0,
      });
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-account"] });
    },
  });
}

export function useUpdatePayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      payload,
    }: {
      code: string;
      payload: {
        businessName?: string;
        settlementBankCode?: string;
        settlementAccountNumber?: string;
      };
    }) => {
      const body: Record<string, string> = {};
      if (payload.businessName) body.business_name = payload.businessName;
      if (payload.settlementBankCode)
        body.settlement_bank = payload.settlementBankCode;
      if (payload.settlementAccountNumber)
        body.account_number = payload.settlementAccountNumber;

      const res = await api.patch(`/organizer/payout-account/${code}`, body);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-account"] });
    },
  });
}