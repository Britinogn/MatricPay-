import { useAdminDashboard } from "../../hooks/useAdmin";
import { StatCard } from "../../components/ui/StatCard";
import { ErrorState, PageHeaderSkeleton, StatCardSkeleton } from "../../components/ui";
import { formatNaira } from "../../lib/format";

export default function AdminOverviewPage() {
  const { data: metrics, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <ErrorState
        title="Couldn’t load admin overview"
        message="Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Collection totals across all organizers. Amounts are gross (what students paid).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Organizers" value={String(metrics.totalOrganizers)} />
        <StatCard
          label="Campaigns"
          value={String(metrics.totalCampaigns)}
          subtext={`${metrics.activeCampaigns} active`}
        />
        <StatCard label="Students" value={String(metrics.totalStudents)} />
        <StatCard
          label="Successful payments"
          value={String(metrics.successfulPaymentsCount)}
        />
        <StatCard
          label="Gross collected"
          value={formatNaira(metrics.totalAmountCollected)}
          subtext="Student charges, not organizer net"
        />
        <StatCard
          label="Flagged payments"
          value={String(metrics.flaggedPaymentsCount)}
        />
      </div>
    </div>
  );
}