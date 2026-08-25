import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAdminOrganizers,
  useUpdateOrganizerStatus,
} from "../../hooks/useAdmin";
import type { UserStatus } from "../../types";
import { formatNaira } from "../../lib/format";
import { ConfirmModal, ErrorState, ListSkeleton } from "../../components/ui";

export default function AdminOrganizersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{
    id: string;
    name: string;
    next: UserStatus;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useAdminOrganizers({
    page,
    limit: 25,
    search,
    status,
  });
  const updateStatus = useUpdateOrganizerStatus();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const organizers = data?.organizers ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Organizers
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Suspend stops login immediately. Existing campaigns still accept payments unless you force-close them.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as UserStatus | "all");
            setPage(1);
          }}
          className="rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load organizers"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : organizers.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No organizers found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <div className="divide-y divide-(--border) md:hidden">
            {organizers.map((o) => (
              <div key={o.id} className="px-4 py-3.5">
                <p className="text-sm font-medium">{o.fullName}</p>
                <p className="text-xs text-(--text-muted)">{o.email}</p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {o.campaignsCount} campaigns · {formatNaira(o.totalCollected)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={o.status} />
                  <button
                    type="button"
                    onClick={() =>
                      setTarget({
                        id: o.id,
                        name: o.fullName,
                        next: o.status === "suspended" ? "active" : "suspended",
                      })
                    }
                    className="text-sm text-(--primary)"
                  >
                    {o.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-(--border) bg-(--background) text-xs text-(--text-muted)">
              <tr>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Campaigns</th>
                <th className="px-4 py-3 font-medium">Collected</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {organizers.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.fullName}</p>
                    <p className="text-xs text-(--text-muted)">{o.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">{o.campaignsCount}</td>
                  <td className="px-4 py-3">{formatNaira(o.totalCollected)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setTarget({
                          id: o.id,
                          name: o.fullName,
                          next: o.status === "suspended" ? "active" : "suspended",
                        })
                      }
                      className="text-sm font-medium text-(--primary)"
                    >
                      {o.status === "suspended" ? "Reactivate" : "Suspend"}
                    </button>
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
        isOpen={!!target}
        title={target?.next === "suspended" ? "Suspend organizer?" : "Reactivate organizer?"}
        message={
          target?.next === "suspended"
            ? `${target?.name} will not be able to log in. Their active campaigns will keep accepting payments unless you force-close them.`
            : `${target?.name} will be able to log in again.`
        }
        confirmLabel={target?.next === "suspended" ? "Suspend" : "Reactivate"}
        tone={target?.next === "suspended" ? "danger" : "default"}
        isLoading={updateStatus.isPending}
        onCancel={() => setTarget(null)}
        onConfirm={() => {
          if (!target) return;
          updateStatus.mutate(
            { id: target.id, status: target.next },
            {
              onSuccess: () => {
                toast.success(
                  target.next === "suspended" ? "Organizer suspended" : "Organizer reactivated"
                );
                setTarget(null);
              },
              onError: (err: unknown) => {
                const axiosError = err as { response?: { data?: { message?: string } } };
                toast.error(axiosError.response?.data?.message || "Failed to update organizer");
              },
            }
          );
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-(--primary)/10 text-(--primary)"
      : "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
} 