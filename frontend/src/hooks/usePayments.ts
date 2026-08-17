import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface PublicCampaign {
  id: string;
  title: string;
  description: string | null;
  amount: string | number;
  amountType: "fixed" | "minimum";
  currency: string;
  slug: string;
  paymentLink: string;
  campaignType: "restricted" | "open";
  status: string;
  expiresAt: string | null;
  isExpired: boolean;
}

export interface ValidatedStudent {
  id: string;
  matricNumber: string;
  fullName: string;
}

export function usePublicCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-campaign", slug],
    queryFn: async () => {
      const res = await api.get(`/campaigns/slug/${slug}`);
      const payload = res.data.data ?? res.data;
      return (payload.campaign ?? payload) as PublicCampaign;
    },
    enabled: !!slug,
    retry: false,
  });
}

export function useValidateStudent() {
  return useMutation({
    mutationFn: async ({
      slug,
      matricNumber,
    }: {
      slug: string;
      matricNumber: string;
    }) => {
      const res = await api.post(`/campaigns/slug/${slug}/students/validate`, {
        matricNumber,
      });
      const payload = res.data.data ?? res.data;
      return payload as {
        student: ValidatedStudent;
        campaign: PublicCampaign;
      };
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (payload: {
      slug: string;
      matricNumber: string;
      fullName?: string;
      email?: string;
      phone?: string;
      department?: string;
      level?: string;
      amount?: number;
    }) => {
      const res = await api.post("/payments/initiate", payload);
      const data = res.data.data ?? res.data;
      return data as {
        authorizationUrl: string;
        accessCode?: string;
        reference: string;
        amount: number;
        currency: string;
        student: {
          id: string;
          fullName: string;
          matricNumber: string;
        };
      };
    },
  });
}

export function usePaymentStatus(reference: string | undefined) {
  return useQuery({
    queryKey: ["payment-status", reference],
    queryFn: async () => {
      const res = await api.get(`/payments/${reference}/status`);
      const payload = res.data.data ?? res.data;
      return payload as {
        status: string;
        reference: string;
        amount?: number | string;
        currency?: string;
        failureReason?: string | null;
        student?: { fullName?: string; matricNumber?: string };
        campaign?: { title?: string; slug?: string };
      };
    },
    enabled: !!reference,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "successful" || status === "failed" || status === "flagged" || status === "expired") {
        return false;
      }
      return 3000;
    },
  });
}