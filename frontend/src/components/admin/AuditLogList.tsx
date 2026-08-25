import { useEffect, useState } from "react";
import {
  useAdminAuditLogs,
  type AdminAuditLogRow,
} from "../../hooks/useAdmin";
import { ErrorState, ListSkeleton } from "../ui";
import { AuditDetailModal } from "./AuditDetailModal";

const EVENT_LABELS: Record<string, string> = {
  "campaign.created": "Campaign created",
  "campaign.activated": "Campaign activated",
  "campaign.closed": "Campaign closed",
  "campaign.force_closed": "Campaign force-closed",
  "student.imported": "Students imported",
  "payment.initiated": "Payment started",
  "payment.completed": "Payment successful",
  "payment.failed": "Payment failed",
  "organizer.suspended": "Organizer suspended",
  "organizer.reactivated": "Organizer reactivated",
};

export function AuditLogList() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openLog, setOpenLog] = useState<AdminAuditLogRow | null>(null);

  const { data, isLoading, isError, refetch } = useAdminAuditLogs({
    page,
    limit: 25,
    search,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search event, actor, entity"
        className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
      />

      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load audit logs"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No audit logs.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <ul className="divide-y divide-(--border)">
            {logs.map((log) => (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => setOpenLog(log)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-(--background)"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {EVENT_LABELS[log.event] || log.event}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-(--text-muted)">
                      {log.actor?.fullName || log.actorRole}
                      {log.actor?.email ? ` · ${log.actor.email}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-[10px] text-(--text-muted)">
                    {new Date(log.createdAt).toLocaleString("en-NG")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-(--text-muted)">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-(--border) px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-(--border) px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AuditDetailModal log={openLog} onClose={() => setOpenLog(null)} />
    </div>
  );
}