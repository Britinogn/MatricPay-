import { Link } from "react-router-dom";

export function CtaBand() {
  return (
    <section className="px-4 pb-16 md:px-6">
      <div className="mx-auto max-w-6xl rounded-3xl bg-(--primary) px-6 py-12 text-center text-white shadow-lg md:py-16">
        <h2
          className="text-2xl font-semibold md:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Running dues for your set this session?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
          Set up your payout account, create a campaign, and start collecting with verified Paystack payments.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-medium text-(--primary) transition hover:bg-(--background) hover:text-(--primary-hover)"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}