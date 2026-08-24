import type { Campaign } from "../../types/campaign";
import { formatCompactNaira } from "../../lib/format";
import toast from "react-hot-toast";

interface ActiveCampaignCardProps {
  campaign: Campaign;
}

export function ActiveCampaignCard({ campaign }: ActiveCampaignCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: campaign.title, url: campaign.paymentLink });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(campaign.paymentLink);
      toast.success("Payment link copied");
    }
  };

  const statusLabel =
    campaign.status === "active"
      ? "Active Campaign"
      : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-lg overflow-hidden">
      {/* Header – always colored, fixed text color */}
      <div className="bg-(--primary) p-5" style={{ color: "#F7F3E8" }}>
        <p className="text-[11px] uppercase tracking-wide opacity-75 mb-1">{statusLabel}</p>
        <h3 className="font-display text-lg font-semibold mb-3 wrap-break">{campaign.title}</h3>

        {/* On mobile, stack; on sm+, side-by-side */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between text-sm">
          <div>
            <p className="opacity-70 text-xs mb-0.5">Target Amount</p>
            <p className="font-mono font-semibold text-base">
              {formatCompactNaira(campaign.netAmount, campaign.currency)}
            </p>
          </div>

          {campaign.expiresAt && (
            <div className="sm:text-right">
              <p className="opacity-70 text-xs mb-0.5">Due Date</p>
              <p className="font-medium">
                {new Date(campaign.expiresAt).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Perforation */}
      <div className="relative mx-6 border-t-2 border-dashed border-(--border)">
        <span className="absolute -top-2.75 -left-8.75 w-5.5 h-5.5 rounded-full bg-(--background)" />
        <span className="absolute -top-2.75 -right-8.75 w-5.5 h-5.5 rounded-full bg-(--background)" />
      </div>

      <div className="p-5">
        <button
          onClick={handleShare}
          className="w-full rounded-xl border border-(--border) py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background) transition-colors"
        >
          Share Payment Link
        </button>
      </div>
    </div>
  );
}