import { HugeiconsIcon } from "@hugeicons/react";
import { BankIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import type { PayoutAccount } from "../../types";
import { NIGERIAN_BANKS } from "../../lib/nigerianBanks";
import toast from "react-hot-toast";

interface PayoutAccountCardProps {
  account: PayoutAccount;
  onEdit?: () => void;
}

export function PayoutAccountCard({ account, onEdit }: PayoutAccountCardProps) {
  const bankName =
    NIGERIAN_BANKS.find((b) => b.code === account.settlementBankCode)?.name ||
    account.settlementBankCode ||
    "—";

  const handleCopyAccountNumber = async () => {
    if (!account.settlementAccountNumber) {
      toast.error("No account number available");
      return;
    }
    await navigator.clipboard.writeText(account.settlementAccountNumber);
    toast.success("Account number copied");
  };

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
          <HugeiconsIcon icon={BankIcon} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--text-primary)">
            {account.settlementAccountName || "Payout account"}
          </p>
          <p className="mt-1 text-sm text-(--text-muted)">{bankName}</p>

          <div className="mt-1 flex items-center gap-2">
            <p className="font-numeric text-sm text-(--text-primary)">
              {account.settlementAccountNumber || "—"}
            </p>
            {account.settlementAccountNumber && (
              <button
                type="button"
                onClick={handleCopyAccountNumber}
                className="rounded-md p-1 text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
                title="Copy account number"
              >
                <HugeiconsIcon icon={Copy01Icon} size={14} />
              </button>
            )}
          </div>

          {account.paystackSubaccountCode && (
            <p className="mt-2 text-xs text-(--text-muted)">
              Subaccount:{" "}
              <span className="font-numeric">{account.paystackSubaccountCode}</span>
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