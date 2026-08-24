import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreateCampaignPayload, Campaign } from "../types";

// ---------- Query types ----------
export type CampaignsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  status?: "all" | "draft" | "active" | "closed";
  campaignType?: "all" | "restricted" | "open";
};

export type CampaignsListResult = {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
};

// ---------- Hooks ----------

export function useCampaigns(query: CampaignsQuery = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;
  const status = query.status === "all" ? undefined : query.status;
  const campaignType = query.campaignType === "all" ? undefined : query.campaignType;

  return useQuery({
    queryKey: ["campaigns", { page, limit, search, status, campaignType }],
    queryFn: async (): Promise<CampaignsListResult> => {
      const res = await api.get("/campaigns", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(campaignType ? { campaignType } : {}),
        },
      });

      const payload = res.data.data ?? res.data;
      const campaigns = payload.campaigns ?? payload;
      return {
        campaigns: Array.isArray(campaigns) ? campaigns : [],
        total: payload.total ?? (Array.isArray(campaigns) ? campaigns.length : 0),
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
      };
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

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      const res = await api.post("/campaigns", payload);
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
      const res = await api.patch(`/campaigns/${id}/status`, { status });
      const payload = res.data.data ?? res.data;
      return payload.campaign ?? payload;
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      if (campaign?.id) {
        queryClient.setQueryData(["campaigns", campaign.id], campaign);
      }
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/campaigns/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}

export function useBulkDeleteCampaigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const res = await api.post("/campaigns/bulk-delete", { campaignIds });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}