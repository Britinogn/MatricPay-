import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useResolveAccount,
  useCreatePayoutAccount,
  useUpdatePayoutAccount,
} from "../../hooks/usePayoutAccount";
import { NIGERIAN_BANKS } from "../../lib/nigerianBanks";

const schema = z.object({
  businessName: z.string().min(3, "Business name is required").max(255),
  bankCode: z.string().min(1, "Select a bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
});

type FormValues = z.infer<typeof schema>;

interface PayoutAccountFormProps {
  mode?: "create" | "update";
  subaccountCode?: string | null;
  defaultValues?: Partial<FormValues>;
  onSuccess?: () => void;
}

export function PayoutAccountForm({
  mode = "create",
  subaccountCode,
  defaultValues,
  onSuccess,
}: PayoutAccountFormProps) {
  const resolveAccount = useResolveAccount();
  const createAccount = useCreatePayoutAccount();
  const updateAccount = useUpdatePayoutAccount();

  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      bankCode: "",
      accountNumber: "",
      ...defaultValues,
    },
  });

  const handleResolve = async () => {
    const accountNumber = getValues("accountNumber");
    const bankCode = getValues("bankCode");

    if (!bankCode || !/^\d{10}$/.test(accountNumber)) {
      toast.error("Enter a valid bank and 10-digit account number");
      return;
    }

    try {
      const result = await resolveAccount.mutateAsync({
        accountNumber,
        bankCode,
      });
      const name =
        result?.account_name || result?.accountName || result?.data?.account_name;
      if (!name) {
        toast.error("Could not resolve account name");
        return;
      }
      setResolvedName(name);
      toast.success(`Account name: ${name}`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Failed to resolve account"
      );
      setResolvedName(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "update" && subaccountCode) {
        await updateAccount.mutateAsync({
          code: subaccountCode,
          payload: {
            businessName: values.businessName,
            settlementBankCode: values.bankCode,
            settlementAccountNumber: values.accountNumber,
          },
        });
        toast.success("Payout account updated");
      } else {
        await createAccount.mutateAsync({
          businessName: values.businessName,
          settlementBankCode: values.bankCode,
          settlementAccountNumber: values.accountNumber,
          percentageCharge: 0,
        });
        toast.success("Payout account created");
      }
      onSuccess?.();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Failed to save payout account"
      );
    }
  };

  const isSubmitting = createAccount.isPending || updateAccount.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Business name
        </label>
        <input
          {...register("businessName")}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
          placeholder="e.g. CSC Department Dues"
        />
        {errors.businessName && (
          <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Bank
        </label>
        <select
          {...register("bankCode")}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        >
          <option value="">Select bank</option>
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
        {errors.bankCode && (
          <p className="mt-1 text-xs text-red-500">{errors.bankCode.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Account number
        </label>
        <div className="flex gap-2">
          <input
            {...register("accountNumber")}
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            placeholder="0123456789"
          />
          <button
            type="button"
            onClick={handleResolve}
            disabled={resolveAccount.isPending}
            className="shrink-0 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background) disabled:opacity-60"
          >
            {resolveAccount.isPending ? "Checking..." : "Verify"}
          </button>
        </div>
        {errors.accountNumber && (
          <p className="mt-1 text-xs text-red-500">{errors.accountNumber.message}</p>
        )}
        {resolvedName && (
          <p className="mt-2 text-sm font-medium text-(--primary)">
            {resolvedName}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover) disabled:opacity-60"
      >
        {isSubmitting
          ? "Saving..."
          : mode === "update"
            ? "Update payout account"
            : "Save payout account"}
      </button>
    </form>
  );
}