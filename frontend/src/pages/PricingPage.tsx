import { Link } from "react-router-dom";
import { formatNaira } from "../lib/format"; // adjust path as needed

// Example amounts calculated per spec:
// MatricPay fee = 2% of amount
// Paystack fee = 0 if amount < 2500, else min(1.5% + 100, 2000)
const examples = [
  { amount: 2000, platformFee: 40, paystackFee: 0, totalFees: 40, net: 1960 },
  { amount: 5000, platformFee: 100, paystackFee: 175, totalFees: 275, net: 4725 },
  { amount: 10000, platformFee: 200, paystackFee: 250, totalFees: 450, net: 9550 },
  { amount: 20000, platformFee: 400, paystackFee: 400, totalFees: 800, net: 19200 },
  { amount: 50000, platformFee: 1000, paystackFee: 850, totalFees: 1850, net: 48150 },
  { amount: 100000, platformFee: 2000, paystackFee: 1600, totalFees: 3600, net: 96400 },
  { amount: 150000, platformFee: 3000, paystackFee: 2000, totalFees: 5000, net: 145000 },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-3xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-sm text-(--text-muted)">
          You keep most of every payment. We take a small platform fee, and
          Paystack charges its standard processing fee.
        </p>
      </div>

      {/* Fee explanation cards */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            MatricPay platform fee
          </h2>
          <p className="mt-2 text-sm text-(--text-muted">
            We charge <span className="font-semibold text-(--primary)">2%</span>{" "}
            of every successful payment. This covers platform maintenance,
            student verification, dashboard analytics, and secure payment
            processing.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            Paystack processing fee
          </h2>
          <p className="mt-2 text-sm text-(--text-muted">
            Paystack charges{" "}
            <span className="font-semibold text-(--primary)">
              1.5% + ₦100
            </span>{" "}
            per transaction (capped at ₦2,000). Transactions under ₦2,500 are
            exempt from Paystack fees. This fee is also deducted from your
            share because you are the settlement recipient.
          </p>
        </div>
      </div>

      {/* Example table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          How much do I receive?
        </h2>
        <p className="mt-2 text-sm text-(--text-muted">
          The table below shows typical amounts after all fees are deducted.
          Your actual net may vary slightly depending on Paystack’s fee
          calculation for that transaction.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text-muted)">
                <th className="py-3 pr-4 font-medium">Student Pays</th>
                <th className="py-3 pr-4 font-medium">MatricPay (2%)</th>
                <th className="py-3 pr-4 font-medium">Paystack Fee</th>
                <th className="py-3 pr-4 font-medium">Total Fees</th>
                <th className="py-3 font-medium">You Receive</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((row) => (
                <tr
                  key={row.amount}
                  className="border-b border-(--border) last:border-0"
                >
                  <td className="py-3 pr-4 font-numeric text-(--text-primary)">
                    {formatNaira(row.amount)}
                  </td>
                  <td className="py-3 pr-4 font-numeric text-(--text-primary)">
                    {formatNaira(row.platformFee)}
                  </td>
                  <td className="py-3 pr-4 font-numeric text-(--text-primary)">
                    {formatNaira(row.paystackFee)}
                  </td>
                  <td className="py-3 pr-4 font-numeric text-(--text-primary)">
                    {formatNaira(row.totalFees)}
                  </td>
                  <td className="py-3 font-numeric font-semibold text-(--primary)">
                    {formatNaira(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important note */}
      <div className="mt-8 rounded-2xl border border-(--border) bg-(--background) p-6">
        <h3 className="text-sm font-semibold text-(--text-primary)">
          Important note
        </h3>
        <p className="mt-2 text-sm text-(--text-muted">
          The examples above are based on local card transactions. Paystack’s
          fee is capped at ₦2,000 and waived for amounts under ₦2,500. We never
          hold your funds – payments settle directly to your bank account via
          Paystack Subaccounts.
        </p>
        <p className="mt-3 text-sm text-(--text-muted">
          For example, on a <span className="font-medium">₦5,000</span> payment,
          you’ll typically receive about{" "}
          <span className="font-medium text-(--text-primary)">₦4,725</span>{" "}
          after all fees.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          to="/register"
          className="inline-flex rounded-xl bg-(--primary) px-6 py-3 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
        >
          Create your organizer account
        </Link>
      </div>
    </div>
  );
}