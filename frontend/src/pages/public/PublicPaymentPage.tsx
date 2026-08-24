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
      <div className="relative min-h-screen bg-(--background) flex items-center justify-center p-4">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-(--primary)/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-lg">
            <div className="space-y-4">
              <div className="h-4 w-3/4 rounded bg-(--border) animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-(--border) animate-pulse" />
              <div className="h-10 rounded-xl bg-(--border) animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="relative min-h-screen bg-(--background) flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-(--primary)/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <BrandLogo />
          </div>
          <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-lg">
            <ErrorState
              title="Campaign not found"
              message="This payment link is invalid or the campaign no longer exists."
              onRetry={() => refetch()}
            />
          </div>
        </div>
      </div>
    );
  }

  const canPay = campaign.status === "active" && !campaign.isExpired;

  return (
    <div className="relative min-h-screen bg-(--background) px-4 py-6 text-(--text-primary) flex flex-col">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-(--primary)/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md flex-1 space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-lg">
          <CampaignHeader campaign={campaign} />

          {!canPay ? (
            <div className="mt-5 rounded-2xl border border-(--border) bg-(--background) px-4 py-8 text-center text-sm text-(--text-muted)">
              This campaign is not accepting payments right now.
            </div>
          ) : campaign.campaignType === "restricted" ? (
            <RestrictedPaymentForm campaign={campaign} />
          ) : (
            <OpenPaymentForm campaign={campaign} />
          )}
        </div>
      </div>

      {/* Trust footer */}
      <p className="relative mt-6 text-center text-xs text-(--text-muted)">
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