import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

interface PayoutVerificationBannerProps {
  isVerified: boolean;
  verificationError?: string | null;
}

export function PayoutVerificationBanner({
  isVerified,
  verificationError,
}: PayoutVerificationBannerProps) {
  if (isVerified) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={20}
          className="shrink-0"
        />
        <div>
          <p className="font-semibold">Payout account verified</p>
          <p className="mt-0.5">
            Your subaccount is active and ready to receive settlements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
      <HugeiconsIcon
        icon={Clock01Icon}
        size={20}
        className="mt-0.5 shrink-0"
      />
      <div>
        <p className="font-semibold">Payout account pending verification</p>
        <p className="mt-0.5">
          Our team is reviewing your subaccount. This is usually completed
          within a few hours. You'll be able to activate campaigns once
          verified.
        </p>
        {verificationError && (
          <p className="mt-1 text-xs opacity-75">{verificationError}</p>
        )}
      </div>
    </div>
  );
}