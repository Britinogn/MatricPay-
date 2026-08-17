import type { PublicCampaign } from "../../hooks/usePayments";
import { formatNaira } from "../../lib/format";

export function CampaignHeader({ campaign }: { campaign: PublicCampaign }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-(--text-muted)">
        {campaign.campaignType === "restricted" ? "Restricted campaign" : "Open campaign"}
      </p>
      <h1
        className="mt-1 text-2xl font-semibold text-(--text-primary)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {campaign.title}
      </h1>
      {campaign.description && (
        <p className="mt-2 text-sm text-(--text-muted)">{campaign.description}</p>
      )}
      <p className="mt-4 text-sm text-(--text-muted)">
        {campaign.amountType === "minimum" ? "Minimum amount" : "Amount"}
      </p>
      <p className="text-xl font-semibold text-(--primary)">
        {formatNaira(Number(campaign.amount) || 0, campaign.currency)}
      </p>
    </div>
  );
}