import { Link } from "react-router-dom";
import { CampaignList } from "../../components/organizer";

export default function CampaignListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            Manage all your payment campaigns
          </p>
        </div>

        <Link
          to="/dashboard/campaigns/new"
          className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
        >
          + New Campaign
        </Link>
      </div>

      <CampaignList />
    </div>
  );
}