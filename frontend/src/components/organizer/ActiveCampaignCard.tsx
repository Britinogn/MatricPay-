import type { Campaign } from "../../types/campaign";
import { formatNaira } from "../../lib/format";

interface ActiveCampaignCardProps {
  campaign: Campaign;
}

export function ActiveCampaignCard({ campaign }: ActiveCampaignCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: campaign.title, url: campaign.paymentLink });
    } else {
      await navigator.clipboard.writeText(campaign.paymentLink);
    }
  };

  const statusLabel =
    campaign.status === "active"
      ? "Active Campaign"
      : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-lg overflow-hidden">
      {/* Fixed light text: this header is always a green fill in both themes,
          so the text color is fixed rather than --text-primary, which flips
          dark in light mode and would be unreadable here. */}
      <div className="bg-(--primary) p-5" style={{ color: "#F7F3E8" }}>
        <p className="text-[11px] uppercase tracking-wide opacity-75 mb-1">{statusLabel}</p>
        <h3 className="font-display text-lg font-semibold mb-3">{campaign.title}</h3>
        <div className="flex justify-between text-sm">
          <div>
            <p className="opacity-70 text-xs mb-0.5">Target Amount</p>
            <p className="font-mono font-semibold">{formatNaira(campaign.amount, campaign.currency)}</p>
          </div>
          {campaign.expiresAt && (
            <div className="text-right">
              <p className="opacity-70 text-xs mb-0.5">Due Date</p>
              <p className="font-medium">
                {new Date(campaign.expiresAt).toLocaleDateString("en-NG", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Perforation — the ticket-stub tear line from main.html */}
      <div className="relative mx-6 border-t-2 border-dashed border-(--border)">
        <span className="absolute -top-2.75 -left-8.75 w-5.5 h-5.5 rounded-full bg-(--background)" />
        <span className="absolute -top-2.75 -right-8.75  w-5.5 h-5.5 rounded-full bg-(--background)" />
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