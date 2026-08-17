import { Link } from "react-router-dom";
import { useOrganizerOverview } from "../../hooks/useDashboard";
import { useCurrentUser } from "../../hooks";
import { StatCard } from "../../components/ui/StatCard";
import { formatNaira } from "../../lib/format";

interface OverviewCampaign {
  id: string;
  title: string;
  amount: string | number;
  status: string;
  studentCount: number;
  paymentCount: number;
}

interface OrganizerOverviewData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalStudents: number;
    totalCollected: number | string;
  };
  campaigns: OverviewCampaign[];
}

export default function OverviewPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError } = useOrganizerOverview();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-(--text-muted)">Loading overview…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-(--text-muted)">Couldn’t load overview.</p>
      </div>
    );
  }

  // Make sure we always work with the correct shape
  const overviewData = data as OrganizerOverviewData;
  const overview = overviewData.overview;
  const campaigns = overviewData.campaigns ?? [];

  const greeting = getGreeting();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Here’s what’s happening with your campaigns.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Collected"
          value={formatNaira(Number(overview.totalCollected) || 0)}
        />
        <StatCard
          label="Active Campaigns"
          value={String(overview.activeCampaigns ?? 0)}
        />
        <StatCard
          label="Total Students"
          value={String(overview.totalStudents ?? 0)}
        />
        <StatCard
          label="Total Campaigns"
          value={String(overview.totalCampaigns ?? 0)}
        />
      </div>

      {/* Campaigns list */}
      <div className="rounded-2xl border border-(--border) bg-(--surface)">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h2 className="text-sm font-semibold text-(--text-primary)">
            Your Campaigns
          </h2>
          <Link
            to="/dashboard/campaigns/new"
            className="text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
          >
            + New
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-(--text-muted)">No campaigns yet.</p>
            <Link
              to="/dashboard/campaigns/new"
              className="mt-3 inline-block text-sm font-medium text-(--primary)"
            >
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
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--text-primary)">
                    {campaign.title}
                  </p>
                  <p className="mt-0.5 text-xs text-(--text-muted)">
                    {campaign.studentCount} students · {campaign.paymentCount} payments
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium text-(--text-primary)">
                    {formatNaira(Number(campaign.amount) || 0)}
                  </span>
                  <StatusBadge status={campaign.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}