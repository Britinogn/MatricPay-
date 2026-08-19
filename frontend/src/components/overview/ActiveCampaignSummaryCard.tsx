import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { formatCompactNaira } from "../../lib/format";
import type { OverviewCampaign } from "../../types"; 

interface ActiveCampaignSummaryCardProps {
  campaign: OverviewCampaign;
  metrics?: {
    totalCollected: number | string;
    collectionPercentage: number;
  };
  onShare: () => void;
}

export function ActiveCampaignSummaryCard({ campaign, metrics, onShare }: ActiveCampaignSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-br from-(--primary) to-(--primary-hover) text-white shadow-lg">
      <div className="p-5">
        {/* Top status */}
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-300" />
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/80">
            {campaign.status === "active" ? "Active Campaign" : campaign.status}
          </p>
        </div>

        <h2 className="text-xl font-semibold wrap-break" style={{ fontFamily: "var(--font-display)" }}>
          {campaign.title}
        </h2>

        {/* Amounts */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-white/70">Target Amount</p>
            <p className="mt-0.5 font-semibold">{formatCompactNaira(Number(campaign.amount) || 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Collected</p>
            <p className="mt-0.5 font-semibold">
              {metrics ? formatCompactNaira(Number(metrics.totalCollected) || 0) : "—"}
            </p>
          </div>
        </div>

        {/* Progress with target marker */}
        {metrics && (
          <div className="mt-4">
            <div className="relative h-3 w-full overflow-visible rounded-full bg-white/20">
              {/* Target marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white bg-(--accent)"
                style={{ left: `calc(${Math.min(metrics.collectionPercentage, 100)}% - 8px)` }}
              />
              <div
                className="h-full rounded-full bg-(--accent)"
                style={{ width: `${Math.min(metrics.collectionPercentage, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-white/75">
              <span>{formatCompactNaira(Number(metrics.totalCollected) || 0)} collected</span>
              <span>{metrics.collectionPercentage}% of target</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onShare}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-(--primary)"
        >
          <HugeiconsIcon icon={Share08Icon} size={16} />
          Share Payment Link
        </button>
      </div>

      {/* Perforation effect */}
      <div className="relative mx-6 border-t-2 border-dashed border-white/30">
        <span className="absolute -top-2.75 -left-8.75 w-5.5 h-5.5 rounded-full bg-(--background)" />
        <span className="absolute -top-2.75 -right-8.75 w-5.5 h-5.5 rounded-full bg-(--background)" />
      </div>

      {/* Footer area if needed */}
    </div>
  );
}