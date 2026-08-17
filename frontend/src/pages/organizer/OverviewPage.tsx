import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  QrCodeIcon,
  AnalyticsUpIcon,
  Share08Icon,
  Cancel01Icon,
  WavingHandIcon,
} from "@hugeicons/core-free-icons";
import { useOrganizerOverview, useDashboard } from "../../hooks/useDashboard";
import { useCurrentUser } from "../../hooks";
import { StatCard } from "../../components/ui/StatCard";
import { formatNaira } from "../../lib/format";
import {
  ListSkeleton,
  PageHeaderSkeleton,
  StatCardSkeleton,
  ErrorState,
} from "../../components/ui";
import toast from "react-hot-toast";

interface OverviewCampaign {
  id: string;
  title: string;
  amount: string | number;
  status: string;
  studentCount: number;
  paymentCount: number;
  slug?: string;
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

interface RecentPayment {
  id: string;
  amount: string | number;
  status: string;
  createdAt: string;
  student?: {
    fullName?: string;
  };
}

export default function OverviewPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError, refetch } = useOrganizerOverview();

  // const overviewData = data as OrganizerOverviewData | undefined;
  // const overview = overviewData?.overview;
  // const campaigns = overviewData?.campaigns ?? [];

  // // Top active campaign (fallback to first campaign)
  // const topCampaign = useMemo(() => {
  //   return (
  //     campaigns.find((c) => c.status === "active") ?? campaigns[0] ?? null
  //   );
  // }, [campaigns]);
  const overviewData = data as OrganizerOverviewData | undefined;
  const overview = overviewData?.overview;

  const campaigns = useMemo(
    () => overviewData?.campaigns ?? [],
    [overviewData?.campaigns]
  );

  const topCampaign = useMemo(() => {
    return campaigns.find((c) => c.status === "active") ?? campaigns[0] ?? null;
  }, [campaigns]);

  const {
    data: campaignDashboard,
    isLoading: isCampaignLoading,
  } = useDashboard(topCampaign?.id);

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

  const greeting = getGreeting();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  const metrics = campaignDashboard?.metrics;
  const recentPayments = campaignDashboard?.recentPayments ?? [];
  const activeCampaign = campaignDashboard?.campaign;

  const paymentLink =
    activeCampaign?.paymentLink ||
    (topCampaign?.slug
      ? `${window.location.origin}/pay/${topCampaign.slug}`
      : "");

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
      await navigator.share({
        title: activeCampaign?.title || topCampaign?.title,
        url: paymentLink,
      });
    } else {
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Payment link copied");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Here’s what’s happening with your campaigns.
        </p>
      </div> */}

      <div>
        <h1
          className="flex items-center gap-2 text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span>
            {greeting}, {firstName}
          </span>
          <HugeiconsIcon
            icon={WavingHandIcon}
            size={24}
            className="text-(--primary)"
          />
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
          subtext="All campaigns"
        />
        <StatCard
          label="Collection Rate"
          value={
            metrics
              ? `${metrics.collectionPercentage}%`
              : isCampaignLoading
                ? "…"
                : "—"
          }
          subtext={
            metrics
              ? `${metrics.paidStudents} of ${metrics.totalStudents} paid`
              : topCampaign
                ? "From top campaign"
                : "No active campaign"
          }
        />
        <StatCard
          label="Active Campaigns"
          value={String(overview.activeCampaigns ?? 0)}
        />
        <StatCard
          label="Total Students"
          value={String(overview.totalStudents ?? 0)}
        />
      </div>

      {/* Active campaign + actions */}
      {topCampaign && (
        <div className="space-y-4">
          {/* Active campaign card */}
          <div className="overflow-hidden rounded-2xl bg-(--primary) text-white">
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/80">
                  {topCampaign.status === "active"
                    ? "Active Campaign"
                    : topCampaign.status}
                </p>
              </div>

              <h2
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {activeCampaign?.title || topCampaign.title}
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/70">Target Amount</p>
                  <p className="mt-0.5 font-semibold">
                    {formatNaira(
                      Number(activeCampaign?.amount ?? topCampaign.amount) || 0
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">Collected</p>
                  <p className="mt-0.5 font-semibold">
                    {metrics
                      ? formatNaira(Number(metrics.totalCollected) || 0)
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {metrics && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-(--accent)"
                      style={{
                        width: `${Math.min(metrics.collectionPercentage, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-white/75">
                    <span>
                      {formatNaira(Number(metrics.totalCollected) || 0)} collected
                    </span>
                    <span>{metrics.collectionPercentage}% of target</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-(--primary)"
              >
                <HugeiconsIcon icon={Share08Icon} size={16} />
                Share Payment Link
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            <ActionButton
              label="Copy Link"
              icon={Link01Icon}
              onClick={handleCopyLink}
            />
            <ActionButton
              label="Show QR"
              icon={QrCodeIcon}
              onClick={() => {
                if (!paymentLink) {
                  toast.error("No payment link available");
                  return;
                }
                setShowQr(true);
              }}
            />
            <Link
              to={`/dashboard/campaigns/${topCampaign.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-4 text-center transition hover:bg-(--background)"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                <HugeiconsIcon icon={AnalyticsUpIcon} size={18} />
              </div>
              <span className="text-xs font-medium text-(--text-primary)">
                View Report
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Recent payments */}
      {topCampaign && (
        <div className="rounded-2xl border border-(--border) bg-(--surface)">
          <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
            <h2 className="text-sm font-semibold text-(--text-primary)">
              Recent Payments
            </h2>
            <Link
              to={`/dashboard/campaigns/${topCampaign.id}`}
              className="text-sm font-medium text-(--primary)"
            >
              View all
            </Link>
          </div>

          {isCampaignLoading ? (
            <div className="px-4 py-8 text-center text-sm text-(--text-muted)">
              Loading payments…
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-(--text-muted)">
              No payments yet on this campaign.
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {(recentPayments as RecentPayment[]).slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-(--text-primary)">
                      {payment.student?.fullName || "Student"}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {new Date(payment.createdAt).toLocaleTimeString("en-NG", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-(--text-primary)">
                      {formatNaira(Number(payment.amount) || 0)}
                    </p>
                    <p className="text-xs capitalize text-(--text-muted)">
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Existing campaigns list */}
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
                    {campaign.studentCount} students · {campaign.paymentCount}{" "}
                    payments
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

      {/* Simple QR modal */}
      {showQr && paymentLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--surface) p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-(--text-primary)">
                Payment QR
              </h3>
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="rounded-lg p-1 text-(--text-muted) hover:bg-(--background)"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  paymentLink
                )}`}
                alt="Payment QR code"
                className="h-48 w-48 rounded-xl bg-white p-2"
              />
              <p className="break-all text-center text-xs text-(--text-muted)">
                {paymentLink}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-medium text-white"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof Link01Icon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-4 text-center transition hover:bg-(--background)"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
        <HugeiconsIcon icon={icon} size={18} />
      </div>
      <span className="text-xs font-medium text-(--text-primary)">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-(--primary)/10 text-(--primary)",
    draft: "bg-(--accent)/10 text-(--accent)",
    closed: "bg-(--border) text-(--text-muted)",
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