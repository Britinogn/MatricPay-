import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileNotFoundIcon } from "@hugeicons/core-free-icons";
import { formatCompactNaira } from "../../lib/format";

interface RecentPayment {
  id: string;
  amount: string | number;
  status: string;
  createdAt: string;
  student?: { fullName?: string };
}

interface RecentPaymentsSectionProps {
  payments: RecentPayment[];
  isLoading: boolean;
  campaignId: string;
}

export function RecentPaymentsSection({ payments, isLoading, campaignId }: RecentPaymentsSectionProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface)">
      <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
        <h2 className="text-sm font-semibold text-(--text-primary)">Recent Payments</h2>
        <Link to={`/dashboard/campaigns/${campaignId}`} className="text-sm font-medium text-(--primary)">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="px-4 py-8 text-center text-sm text-(--text-muted)">Loading payments…</div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <HugeiconsIcon icon={FileNotFoundIcon} size={32} className="text-(--text-muted) mb-3" />
          <p className="text-sm text-(--text-muted)">No payments yet on this campaign.</p>
        </div>
      ) : (
        <div className="divide-y divide-(--border)">
          {payments.slice(0, 5).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--text-primary)">
                  {payment.student?.fullName || "Student"}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {new Date(payment.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-(--text-primary)">
                  {formatCompactNaira(Number(payment.amount) || 0)}
                </p>
                <p className="text-xs capitalize text-(--text-muted)">{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}