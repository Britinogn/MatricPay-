import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AuditLogRow {
  id: string;
  event: string;
  entityType: string;
  entityId: string;
  actorRole: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string } | null;
}

export function useOrganizerAuditLogs(page = 1, limit = 25) {
  return useQuery({
    queryKey: ["audit-logs", "organizer", page, limit],
    queryFn: async () => {
      const res = await api.get("/organizer/audit-logs", {
        params: { page, limit },
      });
      const payload = res.data.data ?? res.data;
      return {
        logs: (payload.logs ?? []) as AuditLogRow[],
        pagination: payload.pagination ?? {
          page,
          limit,
          total: 0,
          totalPages: 1,
        },
      };
    },
  });
}