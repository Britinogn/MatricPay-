import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { useCampaigns } from "../../hooks/useCampaigns";
import { ListSkeleton, ErrorState } from "../../components/ui";

export default function ReportsPage() {
  const { data, isLoading, isError, refetch } = useCampaigns({
    page: 1,
    limit: 50,
  });
  const campaigns = data?.campaigns ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Reports
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Export paid students for each campaign
        </p>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load campaigns"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-muted)">
          No campaigns yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
          <div className="divide-y divide-(--border)">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--text-primary)">
                    {campaign.title}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-(--text-muted)">
                    {campaign.status}
                  </p>
                </div>
                <Link
                  to={`/dashboard/reports/${campaign.id}`}
                  title="View report"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
                >
                  <HugeiconsIcon icon={ViewIcon} size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}