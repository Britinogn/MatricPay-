import { Link } from "react-router-dom";
import { formatNaira } from "../lib/format";

const examples = [
  {
    amount: 1000,
    platformFee: 20,
    paystackFee: 15,
    net: 965,
  },
  {
    amount: 2000,
    platformFee: 40,
    paystackFee: 30,
    net: 1930,
  },
  {
    amount: 5000,
    platformFee: 100,
    paystackFee: 175,
    net: 4725,
  },
  {
    amount: 10000,
    platformFee: 200,
    paystackFee: 250,
    net: 9550,
  },
  {
    amount: 20000,
    platformFee: 400,
    paystackFee: 400,
    net: 19200,
  },
  {
    amount: 50000,
    platformFee: 1000,
    paystackFee: 850,
    net: 48150,
  },
  {
    amount: 100000,
    platformFee: 2000,
    paystackFee: 1600,
    net: 96400,
  },
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

        <p className="mx-auto mt-2 max-w-2xl text-sm text-(--text-muted)">
          Keep more of every payment. MatricPay charges a simple 2% platform
          fee, while Paystack applies its standard transaction fee.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              MatricPay fee
            </h2>

            <span className="rounded-full bg-(--background) px-3 py-1 text-xs font-semibold text-(--primary)">
              2%
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-(--text-muted)">
            We charge 2% of every successful payment. This helps cover the
            platform, payment infrastructure, student verification, and
            organizer tools.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Paystack fee
            </h2>

            <span className="rounded-full bg-(--background) px-3 py-1 text-xs font-semibold text-(--primary)">
              1.5% + ₦100
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-(--text-muted)">
            Paystack charges 1.5% + ₦100 on local transactions. The ₦100 fee
            is waived for transactions below ₦2,500, and local transaction
            fees are capped at ₦2,000.
          </p>
        </div>
      </div>

      {/* How the money is split */}
      <div className="mt-10 rounded-2xl border border-(--border) bg-(--surface) p-6">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          How your payment is split
        </h2>

        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          When a student pays, the payment is automatically split between
          MatricPay and your verified payout account through Paystack.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-(--background) p-4">
            <p className="text-xs text-(--text-muted)">MatricPay</p>
            <p className="mt-1 text-lg font-semibold text-(--text-primary)">
              2%
            </p>
          </div>

          <div className="rounded-xl bg-(--background) p-4">
            <p className="text-xs text-(--text-muted)">Your share</p>
            <p className="mt-1 text-lg font-semibold text-(--text-primary)">
              98%
            </p>
          </div>

          <div className="rounded-xl bg-(--background) p-4">
            <p className="text-xs text-(--text-muted)">Paystack</p>
            <p className="mt-1 text-lg font-semibold text-(--text-primary)">
              Processing fee
            </p>
          </div>
        </div>
      </div>

      {/* Example table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-(--text-primary)">
          Example payouts
        </h2>

        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          These examples show how the fees affect the organizer's settlement
          when the Paystack transaction fee is deducted from the amount
          available to the organizer. Actual fees depend on the payment
          channel and Paystack's applicable pricing.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text-muted)">
                <th className="py-3 pr-4 font-medium">Student Pays</th>
                <th className="py-3 pr-4 font-medium">MatricPay (2%)</th>
                <th className="py-3 pr-4 font-medium">Paystack Fee</th>
                <th className="py-3 font-medium">Organizer Receives</th>
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

                  <td className="py-3 font-numeric font-semibold text-(--primary)">
                    {formatNaira(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification */}
      <div className="mt-10 rounded-2xl border border-(--border) bg-(--surface) p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--background) text-(--primary)">
            ✓
          </div>

          <div>
            <h2 className="text-base font-semibold text-(--text-primary)">
              Payout account verification
            </h2>

            <p className="mt-2 text-sm leading-6 text-(--text-muted)">
              Before your first payout can be processed, your payout account
              must be verified through Paystack. This verification is completed
              manually and may take up to 24 hours.
            </p>

            <p className="mt-3 text-sm leading-6 text-(--text-muted)">
              Once your payout account is verified, future payments can be
              processed automatically. If you change your bank details, the
              updated payout account may need to be verified again.
            </p>
          </div>
        </div>
      </div>

      {/* Important note */}
      <div className="mt-6 rounded-2xl border border-(--border) bg-(--background) p-6">
        <h3 className="text-sm font-semibold text-(--text-primary)">
          Good to know
        </h3>

        <ul className="mt-3 space-y-2 text-sm leading-6 text-(--text-muted)">
          <li>
            • Your campaign payments are automatically split through Paystack.
          </li>
          <li>
            • MatricPay does not manually transfer your campaign money.
          </li>
          <li>
            • Your payout account only needs to go through verification before
            its first payout.
          </li>
          <li>
            • Changing your bank details can trigger another verification
            requirement.
          </li>
          <li>
            • Paystack's transaction fees are separate from MatricPay's 2%
            platform fee.
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          to="/register"
          className="inline-flex rounded-xl bg-(--primary) px-6 py-3 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
        >
          Create your organizer account
        </Link>

        <p className="mt-3 text-xs text-(--text-muted)">
          Set up your payout account during registration.
        </p>
      </div>
    </div>
  );
}