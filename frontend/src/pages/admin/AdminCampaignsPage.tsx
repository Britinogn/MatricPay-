import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAdminCampaigns,
  useAdminForceCloseCampaign,
} from "../../hooks/useAdmin";
import type { CampaignStatus } from "../../types";
import { ConfirmModal, ErrorState, ListSkeleton } from "../../components/ui";

export default function AdminCampaignsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [closeTarget, setCloseTarget] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading, isError, refetch } = useAdminCampaigns({
    page,
    limit: 25,
    search,
    status,
  });
  const forceClose = useAdminForceCloseCampaign();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const campaigns = data?.campaigns ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Platform-wide. Force-close stops new payments; pending checkouts can still settle.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search title or slug"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as CampaignStatus | "all");
            setPage(1);
          }}
          className="rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load campaigns"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No campaigns found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <div className="divide-y divide-(--border) md:hidden">
            {campaigns.map((c) => (
              <div key={c.id} className="px-4 py-3.5">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-(--text-muted)">
                  {c.organizer?.fullName} · {c.totalStudents} students
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <CampaignBadge status={c.isExpired ? "expired" : c.status} />
                  {c.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => setCloseTarget({ id: c.id, title: c.title })}
                      className="text-sm text-red-600"
                    >
                      Force close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-(--border) bg-(--background) text-xs text-(--text-muted)">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Students</th>
                <th className="px-4 py-3 font-medium">Payments</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-(--text-muted)">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{c.organizer?.fullName}</p>
                    <p className="text-xs text-(--text-muted)">{c.organizer?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <CampaignBadge status={c.isExpired ? "expired" : c.status} />
                  </td>
                  <td className="px-4 py-3">{c.totalStudents}</td>
                  <td className="px-4 py-3">{c.totalPayments}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status !== "closed" && (
                      <button
                        type="button"
                        onClick={() => setCloseTarget({ id: c.id, title: c.title })}
                        className="text-sm font-medium text-red-600"
                      >
                        Force close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <ConfirmModal
        isOpen={!!closeTarget}
        title="Force-close campaign?"
        message={`“${closeTarget?.title}” will stop accepting new payments. Checkouts already in progress can still settle.`}
        confirmLabel="Force close"
        tone="danger"
        isLoading={forceClose.isPending}
        onCancel={() => setCloseTarget(null)}
        onConfirm={() => {
          if (!closeTarget) return;
          forceClose.mutate(closeTarget.id, {
            onSuccess: () => {
              toast.success("Campaign force-closed");
              setCloseTarget(null);
            },
            onError: (err: unknown) => {
              const axiosError = err as { response?: { data?: { message?: string } } };
              toast.error(axiosError.response?.data?.message || "Failed to close campaign");
            },
          });
        }}
      />
    </div>
  );
}

function CampaignBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-(--primary)/10 text-(--primary)",
    draft: "bg-(--accent)/10 text-(--accent)",
    closed: "bg-(--border) text-(--text-muted)",
    expired: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
        styles[status] || styles.closed
      }`}
    >
      {status}
    </span>
  );
}