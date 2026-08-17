import { Link } from "react-router-dom";
import { CampaignCard } from "./CampaignCard";

interface Campaign {
  id: string;
  title: string;
  amount: string | number;
  status: string;
  studentCount?: number;
  paymentCount?: number;
}

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading?: boolean;
}

export function CampaignList({ campaigns, isLoading }: CampaignListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
        <p className="text-sm text-(--text-muted)">Loading campaigns…</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
        <p className="text-sm text-(--text-muted)">No campaigns yet.</p>
        <Link
          to="/dashboard/campaigns/new"
          className="mt-3 inline-block text-sm font-medium text-(--primary)"
        >
          Create your first campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
      <div className="divide-y divide-(--border)">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}