import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  CreditCardIcon,
  Megaphone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { StatCard } from "../../components/ui/StatCard";
import { Sparkline } from "./Sparkline";
import { formatCompactNaira } from "../../lib/format";

interface OverviewStatsProps {
  totalCollected: number | string;
  activeCampaigns: number;
  totalStudents: number;
  collectionPercentage?: number;
  paidStudents?: number;
  totalStudentsForRate?: number;
  isLoadingRate?: boolean;
  topCampaignExists?: boolean;
  collectedTrend?: number[];
}

function CircularProgress({
  percentage,
  size = 56,
  strokeWidth = 5,
  color = "var(--primary)",
  trackColor = "var(--border)",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function OverviewStats({
  totalCollected,
  activeCampaigns,
  totalStudents,
  collectionPercentage,
  paidStudents,
  totalStudentsForRate,
  isLoadingRate,
  topCampaignExists,
  collectedTrend,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Total Collected with sparkline */}
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-(--text-muted)">Total Collected</span>
          <span className="text-(--primary)">
            <HugeiconsIcon icon={CreditCardIcon} size={18} />
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-numeric text-2xl text-(--text-primary)">
              {formatCompactNaira(Number(totalCollected) || 0)}
            </p>
            <p className="text-xs text-(--text-muted) mt-1">All campaigns</p>
          </div>
          {collectedTrend && <Sparkline data={collectedTrend} />}
        </div>
      </div>

      {/* Collection Rate with circular progress */}
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-(--text-muted)">Collection Rate</span>
          <span className="text-(--primary)">
            <HugeiconsIcon icon={AnalyticsUpIcon} size={18} />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <CircularProgress percentage={collectionPercentage ? Math.min(collectionPercentage, 100) : 0} />
          <div>
            <p className="font-numeric text-xl text-(--text-primary)">
              {isLoadingRate ? "…" : collectionPercentage != null ? `${collectionPercentage}%` : "—"}
            </p>
            <p className="text-xs text-(--text-muted) mt-0.5">
              {paidStudents != null && totalStudentsForRate != null
                ? `${paidStudents} of ${totalStudentsForRate} paid`
                : topCampaignExists
                  ? "From top campaign"
                  : "No active campaign"}
            </p>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <StatCard
        label="Active Campaigns"
        value={String(activeCampaigns ?? 0)}
        icon={<HugeiconsIcon icon={Megaphone01Icon} size={18} />}
      />

      {/* Total Students */}
      <StatCard
        label="Total Students"
        value={String(totalStudents ?? 0)}
        icon={<HugeiconsIcon icon={UserGroupIcon} size={18} />}
      />
    </div>
  );
}