import { Link } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { ListSkeleton, ErrorState } from "../../components/ui";

export default function PaymentsPage() {
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
          Payments
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          View student payments by campaign
        </p>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn’t load campaigns"
          message="Please check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
          <p className="text-sm text-(--text-muted)">No campaigns yet.</p>
          <Link
            to="/dashboard/campaigns/new"
            className="mt-3 inline-block text-sm font-medium text-(--primary)"
          >
            Create a campaign
          </Link>
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
                    {campaign.campaignType ? ` · ${campaign.campaignType}` : ""}
                  </p>
                </div>

                <Link
                  to={`/dashboard/payments/${campaign.id}`}
                  className="shrink-0 rounded-xl border border-(--border) px-3 py-1.5 text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}