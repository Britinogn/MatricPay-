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
    <form onSubmit={handlePay} className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">Matric number</label>
        <input
          value={matricNumber}
          onChange={(e) => setMatricNumber(e.target.value)}
          required
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Email <span className="text-(--text-muted)">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
      </div>

      {isMinimum ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Amount (min {formatNaira(minAmount, campaign.currency)})
          </label>
          <input
            type="number"
            min={minAmount}
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
          />
        </div>
      ) : (
        <div>
          <p className="text-xs text-(--text-muted)">Amount</p>
          <p className="text-lg font-semibold text-(--primary)">
            {formatNaira(minAmount, campaign.currency)}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={initiatePayment.isPending}
        className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover) disabled:opacity-60"
      >
        {initiatePayment.isPending ? "Redirecting..." : "Pay with Paystack"}
      </button>
    </form>
  );
}
