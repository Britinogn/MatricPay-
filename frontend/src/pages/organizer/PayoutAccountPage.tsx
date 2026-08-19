import { useState } from "react";
import { usePayoutAccount } from "../../hooks/usePayoutAccount";
import { PayoutAccountCard, PayoutAccountForm } from "../../components/payout";
import {
  PageHeaderSkeleton,
  ErrorState,
} from "../../components/ui";


export default function PayoutAccountPage() {
  const { data, isLoading, isError, refetch } = usePayoutAccount();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="h-48 animate-pulse rounded-2xl bg-(--border)/40" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn’t load payout account"
        onRetry={() => refetch()}
      />
    );
  }

  const hasAccount = Boolean(data?.paystackSubaccountCode);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Payout Account
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Set up the bank account where campaign payments will be settled.
        </p>
      </div>

      {hasAccount && !isEditing ? (
        <PayoutAccountCard
          account={data!}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="mb-4 text-sm text-(--text-muted) hover:text-(--text-primary)"
            >
              ← Cancel
            </button>
          )}

          <PayoutAccountForm
            mode={hasAccount ? "update" : "create"}
            subaccountCode={data?.paystackSubaccountCode}
            defaultValues={
              hasAccount
                ? {
                    businessName: data?.settlementAccountName || "",
                    bankCode: data?.settlementBankCode || "",
                    accountNumber: data?.settlementAccountNumber || "",
                  }
                : undefined
            }
            onSuccess={() => {
              setIsEditing(false);
              refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}