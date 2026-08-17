import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Campaign, CreateCampaignPayload } from "../types";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get("/campaigns");
      // handle both shapes safely
      const payload = res.data.data ?? res.data;
      return payload.campaigns ?? payload;
    },
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}`);
      const payload = res.data.data ?? res.data;
      return payload.campaign ?? payload;
    },
    enabled: !!id,
  });
}

// export function useCampaign(id: string | undefined) {
//   return useQuery({
//     queryKey: ["campaigns", id],
//     queryFn: async () => {
//       const res = await api.get<{ data: Campaign }>(`/campaigns/${id}`);
//       return res.data.data;
//     },
//     enabled: !!id,
//   });
// }

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      const res = await api.post("/campaigns", payload);
      // support both shapes
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCampaignPayload>;
    }) => {
      const res = await api.patch(`/campaigns/${id}`, payload);
      const payloadData = res.data.data ?? res.data;
      return payloadData.campaign ?? payloadData;
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      if (campaign?.id) {
        queryClient.setQueryData(["campaigns", campaign.id], campaign);
      }
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "closed";
    }) => {
      const { data } = await api.patch<{ data: Campaign }>(
        `/campaigns/${id}/status`,
        { status }
      );
      return data.data;
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.setQueryData(["campaigns", campaign.id], campaign);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}