import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { useCampaign } from "../../hooks/useCampaigns";
import { useCampaignPayments } from "../../hooks/useCampaignPayments";
import type { PaymentStatus } from "../../types";
import { formatNaira } from "../../lib/format";
import { BackLink } from "../../components/ui/BackLink";
import { ListSkeleton, ErrorState } from "../../components/ui";

const STATUS_FILTERS: { label: string; value: PaymentStatus }[] = [
  { label: "Successful", value: "successful" },
  { label: "Pending", value: "pending" },
  { label: "Flagged", value: "flagged" },
  { label: "Failed", value: "failed" },
  { label: "Expired", value: "expired" },
  { label: "Superseded", value: "superseded" },
];

export default function CampaignPaymentsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  const [status, setStatus] = useState<PaymentStatus>("successful");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId);

  const { data, isLoading, isError, refetch } = useCampaignPayments(campaignId, {
    status,
    search,
    page,
    limit,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const payments = data?.payments ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <BackLink to="/dashboard/payments" label="Back to payments" />

      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {campaignLoading ? "…" : campaign?.title || "Campaign payments"}
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Student payments for this campaign
        </p>
      </div>

      {/* Status chips — default successful */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setStatus(item.value);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              status === item.value
                ? "bg-(--primary) text-white"
                : "border border-(--border) bg-(--surface) text-(--text-muted)"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)">
          <HugeiconsIcon icon={Search01Icon} size={16} />
        </span>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or matric number"
          className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-3 text-sm outline-none focus:border-(--primary)"
        />
      </div>

            {/* List */}
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load payments"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
          <p className="text-sm text-(--text-muted)">
            No {status} payments{search ? " match your search" : " yet"}.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface) md:hidden">
            <div className="divide-y divide-(--border)">
              {payments.map((payment) => (
                <div key={payment.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-(--text-primary)">
                        {payment.student?.fullName || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-(--text-muted)">
                        {payment.student?.matricNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-(--text-primary)">
                        {formatNaira(payment.amount, payment.currency)}
                      </p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-(--text-muted)">
                    <span className="font-mono">{payment.reference}</span>
                    <span>
                      {new Date(payment.createdAt).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-(--border) bg-(--surface) md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-(--border) bg-(--background) text-xs text-(--text-muted)">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Matric</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-(--background)/60">
                    <td className="px-4 py-3 font-medium text-(--text-primary)">
                      {payment.student?.fullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-(--text-muted)">
                      {payment.student?.matricNumber}
                    </td>
                    <td className="px-4 py-3 text-(--text-primary)">
                      {formatNaira(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-(--text-muted)">
                      {payment.reference}
                    </td>
                    <td className="px-4 py-3 text-(--text-muted)">
                      {new Date(payment.createdAt).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-(--text-muted)">
            Page {page} of {totalPages} · {total} total
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
              disabled={page >= totalPages}
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

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    successful: "bg-(--primary)/10 text-(--primary)",
    pending: "bg-(--accent)/10 text-(--accent)",
    flagged: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    expired: "bg-(--border) text-(--text-muted)",
    superseded: "bg-(--border) text-(--text-muted)",
  };

  return (
    <span
      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
        styles[status] || styles.expired
      }`}
    >
      {status}
    </span>
  );
}