import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  AdminCampaignsResult,
  AdminDashboardMetrics,
  AdminOrganizersResult,
  CampaignStatus,
  UserStatus,
} from "../types";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      const payload = res.data.data ?? res.data;
      return (payload.metrics ?? payload) as AdminDashboardMetrics;
    },
  });
}

export function useAdminOrganizers(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus | "all";
} = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;
  const status = query.status === "all" ? undefined : query.status;

  return useQuery({
    queryKey: ["admin", "organizers", { page, limit, search, status }],
    queryFn: async (): Promise<AdminOrganizersResult> => {
      const res = await api.get("/admin/organizers", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });
      const payload = res.data.data ?? res.data;
      return {
        organizers: payload.organizers ?? [],
        pagination: payload.pagination ?? {
          page,
          limit,
          total: payload.total ?? 0,
          totalPages: payload.totalPages ?? 1,
        },
      };
    },
  });
}

export function useUpdateOrganizerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: UserStatus;
    }) => {
      const res = await api.patch(`/admin/organizers/${id}/status`, { status });
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminCampaigns(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: CampaignStatus | "all";
} = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;
  const status = query.status === "all" ? undefined : query.status;

  return useQuery({
    queryKey: ["admin", "campaigns", { page, limit, search, status }],
    queryFn: async (): Promise<AdminCampaignsResult> => {
      const res = await api.get("/admin/campaigns", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });
      const payload = res.data.data ?? res.data;
      return {
        campaigns: payload.campaigns ?? [],
        pagination: payload.pagination ?? {
          page,
          limit,
          total: payload.total ?? 0,
          totalPages: payload.totalPages ?? 1,
        },
      };
    },
  });
}

export function useAdminForceCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/campaigns/${id}/status`, {
        status: "closed",
      });
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}