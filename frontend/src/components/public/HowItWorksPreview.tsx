import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function HowItWorksPreview() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
        <div
          id="how-students"
          className="rounded-3xl border border-(--border) bg-(--surface) p-6 md:p-8"
        >
          <h2
            className="text-xl font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            For students
          </h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            No account needed. Open the payment link from your class rep.
          </p>
          <ol className="mt-6 space-y-4 text-sm text-(--text-primary)">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-xs font-semibold text-(--accent)">
                1
              </span>
              Open `/pay/...` link
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-xs font-semibold text-(--accent)">
                2
              </span>
              Enter matric number (or your details)
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-xs font-semibold text-(--accent)">
                3
              </span>
              Pay securely with Paystack
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-xs font-semibold text-(--accent)">
                4
              </span>
              Get a verified payment reference
            </li>
          </ol>
        </div>

        <div className="rounded-3xl bg-(--primary) p-6 text-white md:p-8">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            For organizers
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Create a campaign, share one link, track who has paid.
          </p>
          <ol className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                1
              </span>
              Register and link payout account
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                2
              </span>
              Create & activate a campaign
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                3
              </span>
              Share the payment link
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                4
              </span>
              Watch collections update live
            </li>
          </ol>
          <Link
            to="/how-it-works"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-(--primary) transition hover:bg-(--background)"
          >
            See full guide
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}