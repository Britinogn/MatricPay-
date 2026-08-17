import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
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

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-(--text-muted)">
            <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              Verified payments
            </span>
            <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              Organizer settlements
            </span>
            <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
              Live campaign tracking
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#how-students"
              className="rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover)"
            >
              I&apos;m a Student
            </a>
            <Link
              to="/register"
              className="rounded-xl border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background)"
            >
              I&apos;m an Organizer
            </Link>
          </div>
        </div>

        {/* Image placeholder — replace with your hero art */}
        <div className="relative">
          <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--surface) text-center text-sm text-(--text-muted)">
            {/* [Hero image placeholder]
            <br />
            Student + receipt card */}
            <img src="/images/heropay.png" alt="student + receipt card" />
          </div>
        </div>
      </div>
    </section>
  );
}