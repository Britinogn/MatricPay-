import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { formatNaira } from "../../lib/format";
import { useInitiatePayment, type PublicCampaign } from "../../hooks/usePayments";

export function OpenPaymentForm({ campaign }: { campaign: PublicCampaign }) {
  const initiatePayment = useInitiatePayment();
  const isMinimum = campaign.amountType === "minimum";
  const minAmount = Number(campaign.amount) || 0;

  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(isMinimum ? String(minAmount) : "");
  const paymentAttemptKeyRef = useRef<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      slug: string;
      matricNumber: string;
      fullName: string;
      email?: string;
      amount?: number;
      idempotencyKey: string;
    } = {
      slug: campaign.slug,
      matricNumber: matricNumber.trim(),
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      idempotencyKey: paymentAttemptKeyRef.current ?? crypto.randomUUID(),
    };

    paymentAttemptKeyRef.current = payload.idempotencyKey;

    if (isMinimum) {
      const value = Number(amount);
      if (!value || value < minAmount) {
        toast.error(`Amount must be at least ${formatNaira(minAmount, campaign.currency)}`);
        return;
      }
      payload.amount = value;
    }

    try {
      const result = await initiatePayment.mutateAsync(payload);
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      paymentAttemptKeyRef.current = null;
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Could not start payment");
    }
  };

  return (
    <form
      onSubmit={handlePay}
      className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6"
    >
      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Full name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="e.g. Jane Doe"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
        />
      </div>

      {/* Matric number */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Matric number
        </label>
        <input
          value={matricNumber}
          onChange={(e) => setMatricNumber(e.target.value)}
          required
          placeholder="e.g. FCP/CSC/20/1001"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
        />
      </div>

      {/* Email (optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Email <span className="text-(--text-muted)"></span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
        />
      </div>

      {/* Amount */}
      {isMinimum ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Amount{" "}
            <span className="text-(--text-muted)">
              (min {formatNaira(minAmount, campaign.currency)})
            </span>
          </label>
          <input
            type="number"
            min={minAmount}
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
          />
        </div>
      ) : (
        <div className="rounded-xl bg-(--background) px-4 py-3">
          <p className="text-xs text-(--text-muted)">Amount</p>
          <p className="text-lg font-semibold text-(--primary)">
            {formatNaira(minAmount, campaign.currency)}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={initiatePayment.isPending}
        className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {initiatePayment.isPending ? "Redirecting..." : "Pay with Paystack"}
      </button>
    </form>
  );
}