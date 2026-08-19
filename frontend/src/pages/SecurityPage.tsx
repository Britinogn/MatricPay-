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
    title: "PCI-DSS Compliance",
    body: "Paystack is PCI-DSS Level 1 compliant, ensuring that card data is handled securely and never touches our servers.",
  },
  {
    icon: LockIcon,
    title: "HTTPS Encryption",
    body: "All data between your browser and our servers is encrypted using TLS, protecting sensitive information in transit.",
  },
  {
    icon: KeyIcon,
    title: "Unguessable References",
    body: "Payment references are generated using cryptographically secure methods (UUID v4), making them unguessable and safe for public status checks.",
  },
  {
    icon: File02Icon,
    title: "Webhook Signature Verification",
    body: "We verify every Paystack webhook using a secret key to ensure it actually came from Paystack before processing any payment update.",
  },
  {
    icon: CloudServerIcon,
    title: "No Card Data Stored",
    body: "We never store raw card numbers or CVV. All payment details are handled securely by Paystack's hosted checkout.",
  },
  {
    icon: Alert02Icon,
    title: "Suspicious Activity Monitoring",
    body: "Flagged payments due to amount or currency mismatches are highlighted on the organizer dashboard for manual review.",
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
        <p className="mt-2 text-sm text-(--text-muted)">
          We take the safety of your payments and data seriously.
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

      {/* Additional details */}
      <div className="mt-12 rounded-2xl border border-(--border) bg-(--background) p-6">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          Additional security measures
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-(--text-muted list-disc pl-5">
          <li>Rate limiting on login and student validation endpoints to prevent brute-force attacks.</li>
          <li>Server-side input validation and parameterized queries to prevent SQL injection.</li>
          <li>Role-based access control ensures organizers only access their own data.</li>
          <li>File upload validation for CSV/Excel imports, including size and type restrictions.</li>
          <li>Audit logs for critical actions performed by organizers and admins.</li>
        </ul>
      </div>
    </div>
  );
}