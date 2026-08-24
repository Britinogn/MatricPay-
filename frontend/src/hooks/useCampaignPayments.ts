import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CampaignPayment, CampaignPaymentsResult, PaymentStatus } from "../types";

export type CampaignPaymentsQuery = {
  status?: PaymentStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export function useCampaignPayments(
  campaignId: string | undefined,
  query: CampaignPaymentsQuery = {}
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;
  // Default: successful (your product rule)
  const status = query.status ?? "successful";

  return useQuery({
    queryKey: ["campaigns", campaignId, "payments", { page, limit, search, status }],
    queryFn: async (): Promise<CampaignPaymentsResult> => {
      const res = await api.get(`/campaigns/${campaignId}/payments`, {
        params: {
          page,
          limit,
          status,
          ...(search ? { search } : {}),
        },
      });

      const payload = res.data.data ?? res.data;
      const payments = (payload.payments ?? []) as CampaignPayment[];

      const total = payload.total ?? payments.length;
      const resolvedPage = payload.page ?? page;
      const resolvedLimit = payload.limit ?? limit;
      const totalPages =
        payload.totalPages ?? Math.max(1, Math.ceil(total / resolvedLimit));

      return {
        payments: Array.isArray(payments) ? payments : [],
        total,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
      };
    },
    enabled: !!campaignId,
  });
}