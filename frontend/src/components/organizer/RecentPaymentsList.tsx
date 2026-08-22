import type { Payment, PaymentStatus } from "../../types";
import { formatCompactNaira } from "../../lib/format";

interface PaymentWithStudent extends Payment {
  student?: {
    fullName: string;
  };
}

interface RecentPaymentsListProps {
  payments: PaymentWithStudent[];
}

const statusColors: Record<PaymentStatus, string> = {
  successful: "var(--primary)",
  pending: "var(--accent)",
  failed: "#B3492F",
  expired: "var(--text-muted)",
  superseded: "var(--text-muted)",
  flagged: "#B3492F",
};

function StatusDot({ status }: { status: PaymentStatus }) {
  const color = statusColors[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
}

export function RecentPaymentsList({ payments }: RecentPaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-(--text-muted)">
        No payments yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-(--text-primary)">Recent Payments</h2>

      <div className="rounded-2xl border border-(--border) bg-(--surface) overflow-hidden">
        {/* Desktop table */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="border-b border-(--border) text-left text-(--text-muted)">
              <th className="font-medium px-5 py-3">Students</th>
              <th className="font-medium px-5 py-3">Amount</th>
              <th className="font-medium px-5 py-3">Reference</th>
              <th className="font-medium px-5 py-3">Date &amp; Time</th>
              <th className="font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-(--border) last:border-0">
                <td className="px-5 py-3 text-(--text-primary)">
                  {payment.student?.fullName ?? "Unknown"}
                </td>
                <td className="px-5 py-3 font-mono text-(--text-primary)">
                  {formatCompactNaira(payment.amount, payment.currency)}
                </td>
                <td className="px-5 py-3 font-mono text-(--text-muted) text-xs">{payment.reference}</td>
                <td className="px-5 py-3 text-(--text-muted)">
                  {new Date(payment.createdAt).toLocaleString("en-NG", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3">
                  <StatusDot status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile card list */}
        <ul className="md:hidden divide-y divide-(--border)">
          {payments.map((payment) => (
            <li key={payment.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                {/* Left: student info and reference */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--text-primary) truncate">
                    {payment.student?.fullName ?? "Unknown"}
                  </p>
                  <p className="mt-0.5 text-xs text-(--text-muted)">
                    {new Date(payment.createdAt).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-xs font-mono text-(--text-muted) truncate">
                    {payment.reference}
                  </p>
                </div>

                {/* Right: amount and status */}
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-(--text-primary)">
                    {formatCompactNaira(payment.amount, payment.currency)}
                  </p>
                  <div className="mt-1">
                    <StatusDot status={payment.status} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
