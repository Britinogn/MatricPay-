import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { formatNaira } from "../../lib/format";
import {
  useInitiatePayment,
  useValidateStudent,
  type PublicCampaign,
  type ValidatedStudent,
} from "../../hooks/usePayments";

export function RestrictedPaymentForm({ campaign }: { campaign: PublicCampaign }) {
  const validateStudent = useValidateStudent();
  const initiatePayment = useInitiatePayment();

  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [student, setStudent] = useState<ValidatedStudent | null>(null);
  const paymentAttemptKeyRef = useRef<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await validateStudent.mutateAsync({
        slug: campaign.slug,
        matricNumber: matricNumber.trim(),
      });
      setStudent(result.student);
    } catch (err: unknown) {
      setStudent(null);
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Student not found");
    }
  };

  const handlePay = async () => {
    if (!student) return;

    const idempotencyKey = paymentAttemptKeyRef.current ?? crypto.randomUUID();
    paymentAttemptKeyRef.current = idempotencyKey;

    try {
      const result = await initiatePayment.mutateAsync({
        slug: campaign.slug,
        matricNumber: student.matricNumber,
        email: email.trim(),
        idempotencyKey,
      });
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      paymentAttemptKeyRef.current = null;
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Could not start payment");
    }
  };

  return (
    <div className="space-y-4">
      {!student ? (
        <form
          onSubmit={handleValidate}
          className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
              Matric number
            </label>
            <input
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
              placeholder="e.g. FCP/CSC/20/1001"
              required
            />

            <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none transition focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
            />
            <p className="mt-1.5 text-xs text-(--text-muted)">
              Used only for this Paystack checkout. It is not saved on your student record.
            </p>

          </div>

          <button
            type="submit"
            disabled={validateStudent.isPending}
            className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {validateStudent.isPending ? "Checking..." : "Continue"}
          </button>
        </form>
      ) : (
        <div className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          {/* Student details */}
          <div className="rounded-xl bg-(--background) px-4 py-3">
            <p className="text-xs text-(--text-muted)">Student</p>
            <p className="mt-0.5 text-base font-semibold text-(--text-primary)">
              {student.fullName}
            </p>
            <p className="text-sm text-(--text-muted)">{student.matricNumber}</p>
          </div>

          {/* Amount */}
          <div className="rounded-xl bg-(--background) px-4 py-3">
            <p className="text-xs text-(--text-muted)">Amount</p>
            <p className="mt-0.5 text-lg font-semibold text-(--primary)">
              {formatNaira(Number(campaign.amount) || 0, campaign.currency)}
            </p>
          </div>

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            // disabled={initiatePayment.isPending}
            disabled={initiatePayment.isPending || !email.trim()}
            className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initiatePayment.isPending ? "Redirecting..." : "Pay with Paystack"}
          </button>

          {/* Change matric number */}
          <button
            type="button"
            onClick={() => {
              paymentAttemptKeyRef.current = null;
              setStudent(null);
              setEmail("");
            }}
            className="w-full text-sm text-(--text-muted) transition hover:text-(--text-primary)"
          >
            Use a different matric number
          </button>
        </div>
      )}
    </div>
  );
}