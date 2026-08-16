import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useOrganizerOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const { data } = await api.get("/organizer/overview");
      return data.data;
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