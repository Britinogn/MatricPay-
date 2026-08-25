import { useEffect, useState } from "react";
import { useAdminWebhookLogs } from "../../hooks/useAdmin";
import { ErrorState, ListSkeleton } from "../ui";
import { WebhookDetailModal } from "./WebhookDetailModal";

export function WebhookLogList() {
  const [referenceInput, setReferenceInput] = useState("");
  const [reference, setReference] = useState("");
  const [processed, setProcessed] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAdminWebhookLogs({
    page,
    limit: 25,
    processed,
    reference,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setReference(referenceInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [referenceInput]);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={referenceInput}
          onChange={(e) => setReferenceInput(e.target.value)}
          placeholder="Search reference"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <select
          value={processed}
          onChange={(e) => {
            setProcessed(e.target.value as "all" | "true" | "false");
            setPage(1);
          }}
          className="rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm"
        >
          <option value="all">All</option>
          <option value="true">Processed</option>
          <option value="false">Failed / pending</option>
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load webhooks"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No webhook logs.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <ul className="divide-y divide-(--border)">
            {logs.map((log) => (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(log.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-(--background)"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{log.eventType}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-(--text-muted)">
                      {log.reference || "no reference"}
                    </p>
                    {log.lastError && (
                      <p className="mt-1 line-clamp-1 text-xs text-red-600">
                        {log.lastError}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        log.processed
                          ? "bg-(--primary)/10 text-(--primary)"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.processed ? "Processed" : "Problem"}
                    </span>
                    <p className="mt-1 text-[10px] text-(--text-muted)">
                      {new Date(log.receivedAt).toLocaleString("en-NG")}
                    </p>
                  </div>
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

      <WebhookDetailModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}