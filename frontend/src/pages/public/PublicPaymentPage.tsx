import { useParams } from "react-router-dom";
import { usePublicCampaign } from "../../hooks/usePayments";
import {
  CampaignHeader,
  RestrictedPaymentForm,
  OpenPaymentForm,
} from "../../components/public";
import { ErrorState } from "../../components/ui";

export default function PublicPaymentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, isLoading, isError, refetch } = usePublicCampaign(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--background)">
        <p className="text-sm text-(--text-muted)">Loading campaign…</p>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen bg-(--background)">
        <ErrorState
          title="Campaign not found"
          message="This payment link is invalid or the campaign no longer exists."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const canPay =
    campaign.status === "active" && !campaign.isExpired;

  return (
    <div className="min-h-screen bg-(--background) px-4 py-8 text-(--text-primary)">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <p
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </p>
        </div>

        <CampaignHeader campaign={campaign} />

        {!canPay ? (
          <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-muted)">
            This campaign is not accepting payments right now.
          </div>
        ) : campaign.campaignType === "restricted" ? (
          <RestrictedPaymentForm campaign={campaign} />
        ) : (
          <OpenPaymentForm campaign={campaign} />
        )}
      </div>
    </div>
  );
}