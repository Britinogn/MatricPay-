import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  PaymentStatusResponse,
} from "../types";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (payload: InitiatePaymentPayload) => {
      const { data } = await api.post<{ data: InitiatePaymentResponse }>(
        "/payments/initiate",
        payload
      );
      return data.data;
    },
  });
}

export function usePaymentStatus(reference: string | undefined) {
  return useQuery({
    queryKey: ["payments", reference],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaymentStatusResponse }>(
        `/payments/${reference}/status`
      );
      return data.data;
    },
    enabled: !!reference,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 3000 : false,
  });
}