import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ReloadIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { useCampaigns } from "../../hooks/useCampaigns";
import { CampaignList } from "../../components/organizer";

export default function CampaignListPage() {
  const { data, isLoading, isFetching, isError, refetch } = useCampaigns();
  const campaigns = data ?? [];

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Reload"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--surface) hover:text-(--text-primary) disabled:opacity-50"
          >
            <HugeiconsIcon icon={ReloadIcon} size={18} className={isFetching ? "animate-spin" : ""} />
          </button>

          <Link
            to="/dashboard/campaigns/new"
            className="flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Campaign
          </Link>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
          <p className="text-sm text-(--text-muted)">Couldn't load campaigns.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
          >
            Try again
          </button>
        </div>
      ) : (
        <CampaignList campaigns={campaigns} isLoading={isLoading} />
      )}
    </div>
  );
}