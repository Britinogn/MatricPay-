import { Link, useSearchParams } from "react-router-dom";
import { usePaymentStatus } from "../../hooks/usePayments";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Clock01Icon,
  InformationCircleIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { formatNaira } from "../../lib/format";

export default function PaymentSuccessPage() {
  // const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const reference = params.get("reference") || undefined;

  const { data, isLoading, isError, refetch } = usePaymentStatus(reference);

  const status = data?.status;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-(--background) px-4 py-6 text-(--text-primary)">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-(--primary)/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand logo */}
        <div className="mb-5 text-center">
          <span
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </span>
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-lg">
          {/* Missing reference */}
          {!reference && (
            <div className="flex flex-col items-center space-y-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--background)">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  size={32}
                  className="text-(--text-muted)"
                />
              </div>
              <p className="text-sm text-(--text-muted)">
                Missing payment reference. Please check your link and try again.
              </p>
            </div>
          )}

          {/* Loading */}
          {reference && isLoading && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--primary)/10">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={32}
                  className="animate-pulse text-(--primary)"
                />
              </div>
              <p className="text-sm text-(--text-muted)">Verifying payment…</p>
            </div>
          )}

          {/* Error */}
          {reference && isError && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <HugeiconsIcon
                  icon={CancelCircleIcon}
                  size={32}
                  className="text-red-600"
                />
              </div>
              <p className="text-sm text-red-600">
                Could not verify this payment. Keep this reference:{" "}
                <span className="font-numeric">{reference}</span>
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
              >
                <HugeiconsIcon icon={RefreshIcon} size={16} />
                Try again
              </button>
            </div>
          )}

          {/* Pending */}
          {status === "pending" && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--accent)/10">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={32}
                  className="text-(--accent)"
                />
              </div>
              <p className="text-sm text-(--text-muted)">
                Payment is still processing. This page will update automatically…
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
              >
                <HugeiconsIcon icon={RefreshIcon} size={16} />
                Refresh status
              </button>
            </div>
          )}

          {/* Successful */}
          {status === "successful" && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--primary)/10">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={48}
                  className="text-(--primary)"
                />
              </div>
              <p className="text-xl font-semibold text-(--primary)">
                Payment successful
              </p>
              {data?.amount != null && (
                <p className="text-sm text-(--text-muted)">
                  {formatNaira(Number(data.amount) || 0, data.currency)}
                </p>
              )}
              <p className="text-xs text-(--text-muted)">
                Ref: <span className="font-numeric">{reference}</span>
              </p>
            </div>
          )}

          {/* Failed / Flagged / Expired / Superseded */}
          {(status === "failed" ||
            status === "flagged" ||
            status === "expired" ||
            status === "superseded") && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <HugeiconsIcon
                  icon={CancelCircleIcon}
                  size={48}
                  className="text-red-600"
                />
              </div>
              <p className="text-xl font-semibold text-red-600">
                Payment not completed
              </p>
              <p className="text-sm text-(--text-muted)">
                Status: {status}
                {data?.failureReason ? ` (${data.failureReason})` : ""}
              </p>
              <p className="text-xs text-(--text-muted)">
                Ref: <span className="font-numeric">{reference}</span>
              </p>
            </div>
          )}

          {/* Back to home */}
          {/* {slug && (
          <Link
              to={`/pay/${slug}`}
              className="mt-6 inline-block text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
            >
              Back to campaign
            </Link>
            <Link
              to="/"
              className="mt-6 inline-block text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
            >
              Back to home
            </Link>
          )} */}
          <div className="mt-2 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-(--primary) transition hover:text-(--primary-hover)"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}