import { Link, useParams, useSearchParams } from "react-router-dom";
import { usePaymentStatus } from "../../hooks/usePayments";
import { formatNaira } from "../../lib/format";

export default function PaymentSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const reference = params.get("reference") || undefined;

  const { data, isLoading, isError } = usePaymentStatus(reference);

  const status = data?.status;

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--background) px-4 text-(--text-primary)">
      <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-6 text-center">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Matric<span className="text-(--primary)">Pay</span>
        </p>

        {!reference && (
          <p className="mt-6 text-sm text-(--text-muted)">
            Missing payment reference.
          </p>
        )}

        {reference && isLoading && (
          <p className="mt-6 text-sm text-(--text-muted)">Verifying payment…</p>
        )}

        {reference && isError && (
          <p className="mt-6 text-sm text-red-600">
            Could not verify this payment. Keep this reference: {reference}
          </p>
        )}

        {status === "pending" && (
          <p className="mt-6 text-sm text-(--text-muted)">
            Payment is still processing. This page will update automatically…
          </p>
        )}

        {status === "successful" && (
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-(--primary)">Payment successful</p>
            {data?.amount != null && (
              <p className="text-sm text-(--text-muted)">
                {formatNaira(Number(data.amount) || 0, data.currency)}
              </p>
            )}
            <p className="text-xs text-(--text-muted)">Ref: {reference}</p>
          </div>
        )}

        {(status === "failed" || status === "flagged" || status === "expired") && (
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-red-600">Payment not completed</p>
            <p className="text-sm text-(--text-muted)">
              Status: {status}
              {data?.failureReason ? ` (${data.failureReason})` : ""}
            </p>
            <p className="text-xs text-(--text-muted)">Ref: {reference}</p>
          </div>
        )}

        {slug && (
          <Link
            to={`/pay/${slug}`}
            className="mt-6 inline-block text-sm font-medium text-(--primary)"
          >
            Back to campaign
          </Link>
        )}
      </div>
    </div>
  );
}