import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ApiEnvelope } from "../types/api";
import type { CampaignPaymentsResponse } from "../types/payment";

interface CampaignPaymentsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useCampaignPayments(
  campaignId: string | undefined,
  params: CampaignPaymentsParams
) {
  return useQuery({
    queryKey: ["campaign-payments", campaignId, params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<CampaignPaymentsResponse>>(
        `/campaigns/${campaignId}/payments`,
        {
          params,
        }
      );

      return data.data;
    },
    enabled: !!campaignId,
  });
}