import { HugeiconsIcon } from "@hugeicons/react";
import { BankIcon } from "@hugeicons/core-free-icons";
import type { PayoutAccount } from "../../types";
import { NIGERIAN_BANKS } from "../../lib/nigerianBanks";

interface PayoutAccountCardProps {
  account: PayoutAccount;
  onEdit?: () => void;
}

export function PayoutAccountCard({ account, onEdit }: PayoutAccountCardProps) {
  const bankName =
    NIGERIAN_BANKS.find((b) => b.code === account.settlementBankCode)?.name ||
    account.settlementBankCode ||
    "—";

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
          <HugeiconsIcon icon={BankIcon} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--text-primary)">
            {account.settlementAccountName || "Payout account"}
          </p>
          <p className="mt-1 text-sm text-(--text-muted)">{bankName}</p>
          <p className="mt-0.5 font-mono text-sm text-(--text-primary)">
            {account.settlementAccountNumber || "—"}
          </p>
          {account.paystackSubaccountCode && (
            <p className="mt-2 text-xs text-(--text-muted)">
              Subaccount: {account.paystackSubaccountCode}
            </p>
          )}
        </div>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 w-full rounded-xl border border-(--border) py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background)"
        >
          Update bank details
        </button>
      )}
    </div>
  );
}