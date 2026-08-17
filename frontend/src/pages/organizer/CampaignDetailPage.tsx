import { useParams } from "react-router-dom";
import { useDashboard, useCollectionTimeseries } from "../../hooks/useDashboard";
import { StatCard } from "../../components/ui/StatCard";
import { ActiveCampaignCard } from "../../components/organizer/ActiveCampaignCard";
import { RecentPaymentsList } from "../../components/organizer/RecentPaymentsList";
import { CollectionChart } from "../../components/organizer/CollectionChart";
import { formatNaira } from "../../lib/format";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useDashboard(id);
  const { data: timeseries, isLoading: isTimeseriesLoading } = useCollectionTimeseries(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <p className="text-(--text-muted) font-mono text-sm">Loading dashboard…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <p className="text-(--text-muted) text-sm">Couldn't load this campaign.</p>
      </div>
    );
  }

  const { campaign, metrics, recentPayments } = data;

  return (
    <div className="min-h-screen bg-(--background) p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl text-(--text-primary)">{campaign.title}</h1>
          <p className="text-(--text-muted) text-sm">/{campaign.slug}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Collected" value={formatNaira(metrics.totalCollected, campaign.currency)} />
          <StatCard
            label="Collection Rate"
            value={`${metrics.collectionPercentage}%`}
            subtext={`${metrics.paidStudents} of ${metrics.totalStudents} paid`}
          />
          <StatCard
            label="Pending Amount"
            value={formatNaira(metrics.outstandingBalance, campaign.currency)}
            subtext={`${metrics.unpaidStudents} yet to pay`}
          />
          <StatCard
            label="Total Students"
            value={String(metrics.totalStudents)}
            subtext={metrics.flaggedPayments > 0 ? `${metrics.flaggedPayments} flagged for review` : undefined}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isTimeseriesLoading || !timeseries ? (
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 h-85 flex items-center justify-center">
                <p className="text-(--text-muted) text-sm">Loading chart…</p>
              </div>
            ) : (
              <CollectionChart data={timeseries} currency={campaign.currency} />
            )}
            <RecentPaymentsList payments={recentPayments} />
          </div>
          <div>
            <ActiveCampaignCard campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}