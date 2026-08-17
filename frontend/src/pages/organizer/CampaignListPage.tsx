import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { HugeiconsIcon } from "@hugeicons/react";
import { ReloadIcon } from "@hugeicons/core-free-icons";
import {
  CampaignList,
  CampaignFilters,
  type CampaignStatusFilter,
} from "../../components/organizer";
import { ListSkeleton, PageHeaderSkeleton, ErrorState } from "../../components/ui";

export default function CampaignListPage() {
  const { data, isLoading, isFetching, isError, refetch } = useCampaigns();
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");

  const campaigns = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const counts = useMemo(() => {
    return {
      all: campaigns.length,
      active: campaigns.filter((c) => c.status === "active").length,
      draft: campaigns.filter((c) => c.status === "draft").length,
      closed: campaigns.filter((c) => c.status === "closed").length,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <ListSkeleton rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn’t load campaigns"
        onRetry={() => refetch()}
      />
    );
  }

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
            <HugeiconsIcon
              icon={ReloadIcon}
              size={18}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>

          <Link
            to="/dashboard/campaigns/new"
            className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      <CampaignFilters
        value={statusFilter}
        onChange={setStatusFilter}
        counts={counts}
      />

      <CampaignList campaigns={filteredCampaigns} />
    </div>
  );
}