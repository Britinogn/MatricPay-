import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield02Icon,
  LockIcon,
  KeyIcon,
  File02Icon,
  CloudServerIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";

const securityFeatures = [
  {
    icon: Shield02Icon,
    title: "Secure Payment Processing",
    body: "Payments are processed through Paystack, a PCI-DSS Level 1 compliant payment provider. Sensitive card information is handled by Paystack and does not pass through MatricPay.",
  },
  {
    icon: LockIcon,
    title: "HTTPS Encryption",
    body: "Communication between your browser and MatricPay is protected using HTTPS/TLS encryption to help keep information secure while it is being transmitted.",
  },
  {
    icon: KeyIcon,
    title: "Secure Payment References",
    body: "Payment references are generated using cryptographically secure methods, making transaction references difficult to guess and safer to use when checking payment status.",
  },
  {
    icon: File02Icon,
    title: "Webhook Verification",
    body: "MatricPay verifies Paystack webhook signatures using its Paystack secret key before processing payment status updates, helping prevent unauthorized payment notifications.",
  },
  {
    icon: CloudServerIcon,
    title: "No Card Data Stored",
    body: "MatricPay does not store raw card numbers, CVV codes, or other sensitive card credentials. Payment details are handled through Paystack's secure payment infrastructure.",
  },
  {
    icon: Alert02Icon,
    title: "Payment Monitoring",
    body: "Payment updates are validated against the expected transaction details. Suspicious or inconsistent transactions can be flagged for review before being treated as valid payments.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-3xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Security at MatricPay
        </h1>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-(--text-muted)">
          MatricPay is designed to keep payment information, organizer data,
          and student records protected throughout the payment process.
        </p>
      </div>

      {/* Security features grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {securityFeatures.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-(--border) bg-(--surface) p-6 transition hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
              <HugeiconsIcon icon={item.icon} size={22} />
            </div>

            <h2 className="text-sm font-semibold text-(--text-primary)">
              {item.title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      {/* Payout security */}
      <div className="mt-12 rounded-2xl border border-(--border) bg-(--surface) p-6">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          Secure organizer payouts
        </h2>

        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          Organizer payouts are handled through Paystack Subaccounts. When an
          organizer provides a payout account, the account must be verified
          before the first payout can be processed. This adds an additional
          verification step before funds are released to the organizer.
        </p>

        <p className="mt-3 text-sm leading-6 text-(--text-muted)">
          If an organizer changes their bank details, the updated payout
          account may require verification again before payouts are processed
          to the new account.
        </p>
      </div>

      {/* Additional details */}
      <div className="mt-6 rounded-2xl border border-(--border) bg-(--background) p-6">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          Additional security measures
        </h2>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-(--text-muted)">
          <li>
            Rate limiting on authentication and student validation endpoints
            helps reduce brute-force and automated abuse.
          </li>

          <li>
            Server-side validation is applied to incoming requests before
            sensitive operations are performed.
          </li>

          <li>
            Role-based access control helps ensure organizers can only access
            resources belonging to their campaigns and account.
          </li>

          <li>
            File upload validation is applied to imported student files,
            including supported file types and size restrictions.
          </li>

          <li>
            Critical organizer and administrative actions can be recorded in
            audit logs for accountability and investigation.
          </li>

          <li>
            Payment status is confirmed server-side rather than relying solely
            on information displayed in the student's browser.
          </li>
        </ul>
      </div>

      {/* Closing note */}
      <div className="mt-6 rounded-2xl border border-(--border) bg-(--background) p-6">
        <h2 className="text-sm font-semibold text-(--text-primary)">
          Payments are handled securely
        </h2>

        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          MatricPay does not act as a bank or store card credentials. Payment
          processing and organizer settlement are handled through Paystack,
          while MatricPay focuses on campaign management, student validation,
          payment tracking, and reconciliation.
        </p>
      </div>
    </div>
  );
}