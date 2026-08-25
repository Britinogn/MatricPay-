import { useState } from "react";
import { useOrganizerAuditLogs } from "../../hooks/useAuditLogs";
import { ErrorState, ListSkeleton } from "../../components/ui";

const EVENT_LABELS: Record<string, string> = {
  "campaign.created": "Campaign created",
  "campaign.activated": "Campaign activated",
  "campaign.closed": "Campaign closed",
  "campaign.updated": "Campaign updated",
  "campaign.force_closed": "Campaign force-closed",
  "student.imported": "Students imported",
  "payment.initiated": "Payment started",
  "payment.completed": "Payment successful",
  "payment.failed": "Payment failed",
  "organizer.suspended": "Account suspended",
  "organizer.reactivated": "Account reactivated",
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrganizerAuditLogs(page, 25);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Activity
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Recent actions on your account and campaigns.
        </p>
      </div>

      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load activity"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No activity yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <ul className="divide-y divide-(--border)">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-3.5">
                <p className="text-sm font-medium text-(--text-primary)">
                  {EVENT_LABELS[log.event] || log.event}
                </p>
                <p className="mt-0.5 text-xs text-(--text-muted)">
                  {log.entityType} · {new Date(log.createdAt).toLocaleString("en-NG")}
                </p>
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
    </div>
  );
}