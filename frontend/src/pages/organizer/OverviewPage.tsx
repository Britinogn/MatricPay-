import { useMemo, useState } from "react";
import { useOrganizerOverview, useDashboard } from "../../hooks/useDashboard";
import { useCurrentUser } from "../../hooks";
import { ListSkeleton, PageHeaderSkeleton, StatCardSkeleton, ErrorState } from "../../components/ui";
import {
  OverviewHeader,
  OverviewStats,
  ActiveCampaignSummaryCard,
  QuickActions,
  RecentPaymentsSection,
  CampaignsSection,
  QrModal,
} from "../../components/overview";
import toast from "react-hot-toast";
import type { OverviewCampaign } from "../../types/campaign"; // <-- import real type

interface OrganizerOverviewData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalStudents: number;
    totalCollected: number | string;
  };
  campaigns: OverviewCampaign[]; // <-- use imported type
}

interface RecentPayment {
  id: string;
  amount: string | number;
  status: string;
  createdAt: string;
  student?: { fullName?: string };
}

export default function OverviewPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError, refetch } = useOrganizerOverview();

  const overviewData = data as OrganizerOverviewData | undefined;
  const overview = overviewData?.overview;
  const campaigns = useMemo(() => overviewData?.campaigns ?? [], [overviewData?.campaigns]);

  const topCampaign = useMemo(() => {
    return campaigns.find((c) => c.status === "active") ?? campaigns[0] ?? null;
  }, [campaigns]);

  const { data: campaignDashboard, isLoading: isCampaignLoading } = useDashboard(topCampaign?.id);

  const [showQr, setShowQr] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <ListSkeleton rows={5} />
      </div>
    );
  }

  if (isError || !data || !overview) {
    return (
      <ErrorState
        title="Couldn’t load overview"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const metrics = campaignDashboard?.metrics;
  const recentPayments = campaignDashboard?.recentPayments ?? [];
  const activeCampaign = campaignDashboard?.campaign;

  const paymentLink =
    activeCampaign?.paymentLink ||
    (topCampaign?.slug ? `${window.location.origin}/pay/${topCampaign.slug}` : "");

  const handleCopyLink = async () => {
    if (!paymentLink) {
      toast.error("No payment link available");
      return;
    }
    await navigator.clipboard.writeText(paymentLink);
    toast.success("Payment link copied");
  };

  const handleShare = async () => {
    if (!paymentLink) {
      toast.error("No payment link available");
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeCampaign?.title || topCampaign?.title,
          url: paymentLink,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Payment link copied");
    }
  };

  return (
    <div className="space-y-6">
      <OverviewHeader firstName={firstName} />

      <OverviewStats
        totalCollected={overview.totalCollected}
        activeCampaigns={overview.activeCampaigns}
        totalStudents={overview.totalStudents}
        collectionPercentage={metrics?.collectionPercentage}
        paidStudents={metrics?.paidStudents}
        totalStudentsForRate={metrics?.totalStudents}
        isLoadingRate={isCampaignLoading}
        topCampaignExists={Boolean(topCampaign)}
      />

      {topCampaign && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveCampaignSummaryCard
            campaign={topCampaign} // now typed as OverviewCampaign from types/campaign
            metrics={metrics ? {
              totalCollected: metrics.totalCollected,
              collectionPercentage: metrics.collectionPercentage,
            } : undefined}
            onShare={handleShare}
          />

          <div className="flex flex-col justify-center">
            <QuickActions
              onCopyLink={handleCopyLink}
              onShowQr={() => {
                if (!paymentLink) {
                  toast.error("No payment link available");
                  return;
                }
                setShowQr(true);
              }}
              campaignId={topCampaign.id}
            />
          </div>
        </div>
      )}

      {topCampaign && (
        <RecentPaymentsSection
          payments={recentPayments as RecentPayment[]}
          isLoading={isCampaignLoading}
          campaignId={topCampaign.id}
        />
      )}

      <CampaignsSection campaigns={campaigns} />

      <QrModal
        isOpen={showQr}
        paymentLink={paymentLink}
        onClose={() => setShowQr(false)}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}