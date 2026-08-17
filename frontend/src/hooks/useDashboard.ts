import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ApiEnvelope } from "../types/api";
import type { CampaignDashboard, CollectionTimeseries, OrganizerOverview } from "../types";


export function useOrganizerOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const res = await api.get<{ data: OrganizerOverview }>("/organizer/overview");
      return res.data.data;
    },
  });
}

export function useCampaignDashboard(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", "campaign", campaignId],
    queryFn: async () => {
      const { data } = await api.get(`/organizer/${campaignId}/dashboard`);
      return data.data;
    },
    enabled: !!campaignId,
    refetchInterval: 8000, // polling every 8s as planned
  });
}

// claude 

export function useDashboard(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", campaignId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<CampaignDashboard>>(
        `/campaigns/${campaignId}/dashboard`
      );
      return data.data;
    },
    enabled: !!campaignId,
  });
}

export function useCollectionTimeseries(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", campaignId, "timeseries"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<CollectionTimeseries>>(
        `/campaigns/${campaignId}/dashboard/timeseries`
      );
      return data.data;
    },
    enabled: !!campaignId,
  });
}