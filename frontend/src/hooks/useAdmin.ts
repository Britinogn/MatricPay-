import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  AdminCampaignsResult,
  AdminDashboardMetrics,
  AdminOrganizersResult,
  CampaignStatus,
  UserStatus,
} from "../types";

export interface AdminAuditLogRow {
  id: string;
  event: string;
  entityType: string;
  entityId: string;
  actorRole: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string } | null;
}

export interface AdminWebhookLogRow {
  id: string;
  provider: string;
  eventType: string;
  reference: string | null;
  processed: boolean;
  attempts: number;
  lastError: string | null;
  receivedAt: string;
  processedAt: string | null;
}

export interface AdminWebhookLogDetail extends AdminWebhookLogRow {
  payload: unknown;
}

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

export function useAdminAuditLogs(query: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;

  return useQuery({
    queryKey: ["admin", "audit-logs", { page, limit, search }],
    queryFn: async () => {
      const res = await api.get("/admin/audit-logs", {
        params: { page, limit, ...(search ? { search } : {}) },
      });
      const payload = res.data.data ?? res.data;
      return {
        logs: (payload.logs ?? []) as AdminAuditLogRow[],
        pagination: payload.pagination,
      };
    },
  });
}

export function useAdminWebhookLogs(query: {
  page?: number;
  limit?: number;
  processed?: "all" | "true" | "false";
  reference?: string;
} = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const processed = query.processed === "all" ? undefined : query.processed;
  const reference = query.reference?.trim() || undefined;

  return useQuery({
    queryKey: ["admin", "webhook-logs", { page, limit, processed, reference }],
    queryFn: async () => {
      const res = await api.get("/admin/webhook-logs", {
        params: {
          page,
          limit,
          ...(processed ? { processed } : {}),
          ...(reference ? { reference } : {}),
        },
      });
      const payload = res.data.data ?? res.data;
      return {
        logs: (payload.logs ?? []) as AdminWebhookLogRow[],
        pagination: payload.pagination,
      };
    },
  });
}

export function useAdminWebhookLog(id: string | null) {
  return useQuery({
    queryKey: ["admin", "webhook-logs", id],
    queryFn: async () => {
      const res = await api.get(`/admin/webhook-logs/${id}`);
      const payload = res.data.data ?? res.data;
      return (payload.log ?? payload) as AdminWebhookLogDetail;
    },
    enabled: !!id,
  });
}