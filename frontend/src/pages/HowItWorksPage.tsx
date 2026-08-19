import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link04Icon,
  IdIcon,
  UserAdd01Icon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  UserAccountIcon,
  BankIcon,
  FolderAddIcon,
  UserGroupIcon,
  ChartLineData02Icon,
} from "@hugeicons/core-free-icons";

const studentSteps = [
  { icon: Link04Icon, text: "Open the campaign link from your organizer" },
  { icon: IdIcon, text: "Restricted campaigns: enter your matric number to validate" },
  { icon: UserAdd01Icon, text: "Open campaigns: enter your name and details yourself" },
  { icon: CreditCardIcon, text: "Confirm the amount and pay via Paystack Checkout" },
  { icon: CheckmarkCircle02Icon, text: "Keep your payment reference from the success page" },
];

const organizerSteps = [
  { icon: UserAccountIcon, text: "Register and log in" },
  { icon: BankIcon, text: "Link a payout account — required before any campaign can activate" },
  { icon: FolderAddIcon, text: "Create a campaign — restricted or open" },
  { icon: UserGroupIcon, text: "Restricted campaigns: add or import your student list" },
  { icon: ChartLineData02Icon, text: "Share the link and track collections on your dashboard" },
];

interface FlowImageProps {
  src: string;
  alt: string;
}

function FlowImage({ src, alt }: FlowImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--surface) p-6 text-center">
        <p className="text-xs text-(--text-muted)">
          Add <code className="font-mono text-(--primary)">{src}</code> to show this image
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full rounded-2xl border border-(--border) object-cover shadow-lg ring-1 ring-(--accent)/20 md:aspect-video"
    />
  );
}

function StepFlow({ steps }: { steps: { icon: typeof Link04Icon; text: string }[] }) {
  return (
    <ol className="relative mt-5 space-y-5">
      <div aria-hidden className="absolute left-4.75 top-4 bottom-4 w-px border-l-2 border-dashed border-(--border)" />
      {steps.map((step, index) => (
        <li key={step.text} className="relative flex items-start gap-4">
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--background) text-(--primary)">
            <HugeiconsIcon icon={step.icon} size={18} />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--accent) text-[9px] font-bold text-(--background)">
              {index + 1}
            </span>
          </span>
          <p className="mt-1.5 text-sm text-(--text-primary)">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-(--text-primary)" style={{ fontFamily: "var(--font-display)" }}>
          How MatricPay works
        </h1>
        <p className="mt-2 text-sm text-(--text-muted)">One platform. Two sides. Same verified payment flow.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <a href="#students" className="rounded-full border border-(--border) px-4 py-1.5 text-xs font-medium text-(--text-primary) transition hover:bg-(--surface)">
            I'm a student
          </a>
          <a href="#organizers" className="rounded-full border border-(--border) px-4 py-1.5 text-xs font-medium text-(--text-primary) transition hover:bg-(--surface)">
            I'm an organizer
          </a>
        </div>
      </div>

      <section id="students" className="mt-12 scroll-mt-20 rounded-2xl border border-(--border) bg-(--surface)/50 p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-(--primary)">For students</span>
            <h2 className="mt-1 text-xl font-semibold text-(--text-primary)" style={{ fontFamily: "var(--font-display)" }}>
              No account needed
            </h2>
            <p className="mt-2 text-sm text-(--text-muted)">
              Students do not create accounts. They only use the campaign link shared by their organizer.
            </p>
            <p className="mt-3 inline-block rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 font-mono text-xs text-(--primary)">
              /pay/your-campaign-slug
            </p>
            <StepFlow steps={studentSteps} />
          </div>
          <FlowImage src="/images/student.png" alt="Student payment flow" />
        </div>
      </section>

      <section id="organizers" className="mt-8 scroll-mt-20 rounded-2xl border border-(--border) p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="md:order-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-(--primary)">For organizers</span>
            <h2 className="mt-1 text-xl font-semibold text-(--text-primary)" style={{ fontFamily: "var(--font-display)" }}>
              Set up once, collect all semester
            </h2>
            <p className="mt-2 text-sm text-(--text-muted)">
              Payments settle straight to your own bank account — MatricPay never holds the money.
            </p>
            <StepFlow steps={organizerSteps} />
            <Link to="/register" className="mt-6 inline-flex items-center rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover)">
              Create organizer account
            </Link>
          </div>
          <div className="md:order-1">
            <FlowImage src="/images/organizer.png" alt="Organizer dashboard flow" />
          </div>
        </div>
      </section>
    </div>
  );
}