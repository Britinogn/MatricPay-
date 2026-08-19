import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield02Icon,
  CheckmarkCircle02Icon,
  ReceiptTextIcon,
  ChartIcon,
} from "@hugeicons/core-free-icons";

const features = [
  {
    title: "Secure Payments",
    body: "Students pay safely through Paystack checkout — no screenshot transfers.",
    icon: Shield02Icon,
  },
  {
    title: "Instant Verification",
    body: "Successful payments are verified with Paystack and reflected on the dashboard.",
    icon: CheckmarkCircle02Icon,
  },
  {
    title: "Receipts & Records",
    body: "Every payment has a unique reference organizers can track and reconcile.",
    icon: ReceiptTextIcon,
  },
  {
    title: "Live Campaign Tracking",
    body: "See paid vs unpaid students and collection progress as payments come in.",
    icon: ChartIcon,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-(--border) bg-(--surface)/50 py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold text-(--text-primary) md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need in one place
          </h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Built for class dues, levies, and campus collections.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-(--border) bg-(--background) p-6 transition hover:border-(--primary)/30 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary) transition group-hover:bg-(--primary) group-hover:text-white">
                <HugeiconsIcon icon={item.icon} size={22} />
              </div>
              <h3 className="text-sm font-semibold text-(--text-primary)">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}