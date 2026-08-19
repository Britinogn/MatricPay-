import type { Payment, PaymentStatus } from "../../types";
import { formatNaira } from "../../lib/format";

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
                  {formatNaira(payment.amount, payment.currency)}
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

        <ul className="md:hidden divide-y divide-(--border)">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-(--text-muted) text-xs">
                  {new Date(payment.createdAt).toLocaleTimeString("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-mono text-(--text-primary) text-sm">
                  {formatNaira(payment.amount, payment.currency)}
                </p>
                <StatusDot status={payment.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}