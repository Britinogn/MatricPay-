import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1
        className="text-3xl font-semibold text-(--text-primary)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        How MatricPay works
      </h1>
      <p className="mt-2 text-sm text-(--text-muted)">
        One platform. Two sides. Same verified payment flow.
      </p>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">For students</h2>
        <p className="text-sm text-(--text-muted)">
          Students do not create accounts. They only use the campaign link shared by their organizer.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-(--text-primary)">
          <li>Open the link: <code className="text-(--primary)">/pay/your-campaign-slug</code></li>
          <li>Restricted campaigns: enter matric number to validate</li>
          <li>Open campaigns: enter your name and details</li>
          <li>Confirm amount and continue to Paystack Checkout</li>
          <li>Return to the success page and keep your payment reference</li>
        </ol>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-(--text-primary)">For organizers</h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm text-(--text-primary)">
          <li>Register and log in</li>
          <li>Link a payout account (required before activation)</li>
          <li>Create a campaign (restricted or open)</li>
          <li>For restricted: add/import students, then activate</li>
          <li>Share the payment link and track collections on the dashboard</li>
        </ol>
        <Link
          to="/register"
          className="inline-flex rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover)"
        >
          Create organizer account
        </Link>
      </section>

      {/* Image placeholders */}
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-(--border) text-sm text-(--text-muted)">
          [Student flow image]
        </div>
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-(--border) text-sm text-(--text-muted)">
          [Organizer flow image]
        </div>
      </div>
    </div>
  );
}