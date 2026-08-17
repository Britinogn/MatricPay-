import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import {
  CampaignList,
  CampaignFilters,
  type CampaignStatusFilter,
} from "../../components/organizer";
import { ListSkeleton, PageHeaderSkeleton, ErrorState } from "../../components/ui";

export default function CampaignListPage() {
  const { data, isLoading, isError, refetch } = useCampaigns();
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

        <Link
          to="/dashboard/campaigns/new"
          className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
        >
          + New Campaign
        </Link>
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