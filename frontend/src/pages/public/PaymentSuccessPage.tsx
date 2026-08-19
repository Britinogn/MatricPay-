import { Link, useParams, useSearchParams } from "react-router-dom";
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
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const reference = params.get("reference") || undefined;

  const { data, isLoading, isError, refetch } = usePaymentStatus(reference);

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
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={32}
              className="mx-auto text-(--text-muted)"
            />
            <p className="text-sm text-(--text-muted)">
              Missing payment reference. Please check your link and try again.
            </p>
          </div>
        )}

        {reference && isLoading && (
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={Clock01Icon}
              size={32}
              className="mx-auto animate-pulse text-(--primary)"
            />
            <p className="text-sm text-(--text-muted)">Verifying payment…</p>
          </div>
        )}

        {reference && isError && (
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={CancelCircleIcon}
              size={32}
              className="mx-auto text-red-600"
            />
            <p className="text-sm text-red-600">
              Could not verify this payment. Keep this reference:{" "}
              <span className="font-numeric">{reference}</span>
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-primary) hover:bg-(--background)"
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} />
              Try again
            </button>
          </div>
        )}

        {status === "pending" && (
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={Clock01Icon}
              size={32}
              className="mx-auto text-(--accent)"
            />
            <p className="text-sm text-(--text-muted)">
              Payment is still processing. This page will update automatically…
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-primary) hover:bg-(--background)"
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} />
              Refresh status
            </button>
          </div>
        )}

        {status === "successful" && (
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={48}
              className="mx-auto text-(--primary)"
            />
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

        {(status === "failed" || status === "flagged" || status === "expired") && (
          <div className="mt-6 space-y-3">
            <HugeiconsIcon
              icon={CancelCircleIcon}
              size={48}
              className="mx-auto text-red-600"
            />
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

        {slug && (
          // <Link
          //   to={`/pay/${slug}`}
          //   className="mt-6 inline-block text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
          // >
          //   Back to campaign
          // </Link>
          <Link
            to="/"
            className="mt-6 inline-block text-sm font-medium text-(--primary) hover:text-(--primary-hover)"
          >
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}