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
      <div className="min-h-screen bg-(--background) flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 space-y-4">
            <div className="h-4 w-3/4 rounded bg-(--border) animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-(--border) animate-pulse" />
            <div className="h-10 rounded-xl bg-(--border) animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <BrandLogo />
          </div>
          <ErrorState
            title="Campaign not found"
            message="This payment link is invalid or the campaign no longer exists."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const canPay = campaign.status === "active" && !campaign.isExpired;

  return (
    <div className="min-h-screen bg-(--background) px-4 py-6 text-(--text-primary) flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 space-y-6">
        {/* Brand */}
        <div className="flex justify-center">
          <BrandLogo />
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

      {/* Trust footer */}
      <p className="mt-8 text-center text-xs text-(--text-muted)">
        Secured by <span className="font-medium text-(--text-primary)">Paystack</span>
      </p>
    </div>
  );
}

function BrandLogo() {
  return (
    <span
      className="text-lg font-semibold text-(--text-primary)"
      style={{ fontFamily: "var(--font-display)" }}
    >
      Matric<span className="text-(--primary)">Pay</span>
    </span>
  );
}