import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield02Icon,
  BankIcon,
  ChartLineData02Icon,
} from "@hugeicons/core-free-icons";

function HeroImage() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--surface) p-6 text-center">
        <p className="text-xs text-(--text-muted)">
          Add <code className="font-mono text-(--primary)">/images/heropay.png</code> to show this image
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-lg ring-1 ring-(--accent)/10">
      <img
        src="/images/heropay.png"
        alt="Student payment flow"
        onError={() => setFailed(true)}
        className="w-full aspect-[4/3] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
        <div>
          <p className="text-sm font-medium text-(--text-muted)">
            Verified. Instant. Stress-free.
          </p>
          <h1
            className="mt-3 text-4xl font-semibold leading-tight text-(--text-primary) md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Student Payments{" "}
            <span className="text-(--accent)">Made Simple.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-(--text-muted) md:text-base">
            Pay school fees, accept payments, and track everything in one secure
            platform — verified through Paystack.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-(--text-muted)">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              <HugeiconsIcon icon={Shield02Icon} size={14} className="text-(--primary)" />
              Verified payments
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              <HugeiconsIcon icon={BankIcon} size={14} className="text-(--primary)" />
              Organizer settlements
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              <HugeiconsIcon icon={ChartLineData02Icon} size={14} className="text-(--primary)" />
              Live campaign tracking
            </span>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#how-students"
              className="inline-flex items-center justify-center rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)"
            >
              I'm a Student
            </a>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--text-primary) transition hover:bg-(--background)"
            >
              I'm an Organizer
            </Link>
          </div>
        </div>

        <HeroImage />
      </div>
    </section>
  );
}