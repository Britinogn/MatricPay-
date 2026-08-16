import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreatePayoutAccountPayload, PayoutAccount } from "../types";

export function usePayoutAccount() {
  return useQuery({
    queryKey: ["payout-account"],
    queryFn: async () => {
      const { data } = await api.get<{ data: PayoutAccount }>(
        "/organizer/payout-account"
      );
      return data.data;
    },
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: async (payload: {
      accountNumber: string;
      bankCode: string;
    }) => {
      const { data } = await api.post(
        "/organizer/payout-account/resolve",
        payload
      );
      return data.data;
    },
  });
}

export function useCreatePayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePayoutAccountPayload) => {
      const { data } = await api.post("/organizer/payout-account", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-account"] });
    },
  });
}