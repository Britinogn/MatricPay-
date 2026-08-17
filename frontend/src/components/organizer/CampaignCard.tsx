import { Link } from "react-router-dom";
import { formatNaira } from "../../lib/format";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    amount: string | number;
    status: string;
    studentCount?: number;
    paymentCount?: number;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      to={`/dashboard/campaigns/${campaign.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-(--background)"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-(--text-primary)">
          {campaign.title}
        </p>
        <p className="mt-0.5 text-xs text-(--text-muted)">
          {campaign.studentCount ?? 0} students · {campaign.paymentCount ?? 0} payments
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-medium text-(--text-primary)">
          {formatNaira(Number(campaign.amount) || 0)}
        </span>
        <StatusBadge status={campaign.status} />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    draft:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    closed:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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