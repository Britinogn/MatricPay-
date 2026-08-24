import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FileNotFoundIcon } from "@hugeicons/core-free-icons";
import { formatCompactNaira } from "../../lib/format";
import type { OverviewCampaign } from "../../types";

interface CampaignsSectionProps {
  campaigns: OverviewCampaign[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-(--primary)/10 text-(--primary)",
    draft: "bg-(--accent)/10 text-(--accent)",
    closed: "bg-(--border) text-(--text-muted)",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${styles[status] || styles.closed}`}>{status}</span>;
}

export function CampaignsSection({ campaigns }: CampaignsSectionProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface)">
      <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
        <h2 className="text-sm font-semibold text-(--text-primary)">Your Campaigns</h2>
        <Link to="/dashboard/campaigns/new" className="text-sm font-medium text-(--primary) hover:text-(--primary-hover)">
          + New
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <HugeiconsIcon icon={FileNotFoundIcon} size={32} className="text-(--text-muted) mb-3" />
          <p className="text-sm text-(--text-muted)">No campaigns yet.</p>
          <Link
            to="/dashboard/campaigns/new"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2 text-sm font-medium text-white"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-(--border)">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/dashboard/campaigns/${campaign.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-(--background)"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--text-primary)">{campaign.title}</p>
                <p className="mt-0.5 text-xs text-(--text-muted)">
                  {campaign.studentCount} students · {campaign.paymentCount} payments
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium text-(--text-primary)">
                  {formatCompactNaira(Number(campaign.netAmount) || 0)}
                </span>
                <StatusBadge status={campaign.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}