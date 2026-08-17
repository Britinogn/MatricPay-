import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CreditCardIcon,
  ChartIcon,
  Settings01Icon,
  HelpCircleIcon,
  Mail01Icon,
  InformationCircleIcon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../../hooks";

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const accountItems = [
  {
    label: "Payouts",
    icon: CreditCardIcon,
    to: "/dashboard/payout-account",
    available: true,
  },
  {
    label: "Reports",
    icon: ChartIcon,
    to: null,
    available: false,
  },
  {
    label: "Settings",
    icon: Settings01Icon,
    to: null,
    available: false,
  },
];

const supportItems = [
  {
    label: "Help Center",
    icon: HelpCircleIcon,
    to: null,
    available: false,
  },
  {
    label: "Contact Support",
    icon: Mail01Icon,
    to: null,
    available: false,
  },
  {
    label: "About MatricPay",
    icon: InformationCircleIcon,
    to: null,
    available: false,
  },
];

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-(--surface) pb-10 shadow-2xl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-(--border)" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2
            className="text-xl font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            More
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-(--text-muted) hover:bg-(--background)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="mx-5 mb-6 flex items-center gap-3.5 rounded-2xl bg-(--primary) px-4 py-4 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-[15px] font-semibold">
              {user?.fullName ?? "User"}
            </p>
            <p className="text-xs capitalize text-white/70">
              {user?.role ?? "organizer"}
            </p>
          </div>

          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            className="text-white/50"
          />
        </div>

        {/* Account Section */}
        <Section title="Account">
          {accountItems.map((item, index) => (
            <MoreRow
              key={item.label}
              {...item}
              isLast={index === accountItems.length - 1}
              onNavigate={onClose}
            />
          ))}
        </Section>

        {/* Support Section */}
        <Section title="Support">
          {supportItems.map((item, index) => (
            <MoreRow
              key={item.label}
              {...item}
              isLast={index === supportItems.length - 1}
              onNavigate={onClose}
            />
          ))}
        </Section>

        {/* Logout */}
        <div className="px-5 mt-2">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-medium text-red-600"
          >
            <HugeiconsIcon icon={Logout01Icon} size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 mb-5">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        {title}
      </p>
      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--background)">
        {children}
      </div>
    </div>
  );
}

interface MoreRowProps {
  label: string;
  icon: typeof CreditCardIcon;
  to: string | null;
  available: boolean;
  isLast: boolean;
  onNavigate: () => void;
}

function MoreRow({
  label,
  icon,
  to,
  available,
  isLast,
  onNavigate,
}: MoreRowProps) {
  const row = (
    <div
      className={`flex items-center gap-3.5 px-4 py-3.5 ${
        !isLast ? "border-b border-(--border)" : ""
      } ${available ? "text-(--text-primary)" : "text-(--text-muted)"}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--surface)">
        <HugeiconsIcon icon={icon} size={18} />
      </div>

      <span className="flex-1 text-[15px] font-medium">{label}</span>

      {available ? (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          className="text-(--text-muted)"
        />
      ) : (
        <span className="rounded-full bg-(--surface) px-2.5 py-0.5 text-[10px] font-medium text-(--text-muted)">
          Soon
        </span>
      )}
    </div>
  );

  if (available && to) {
    return (
      <Link to={to} onClick={onNavigate} className="block active:bg-(--surface)">
        {row}
      </Link>
    );
  }

  return <div className="cursor-default">{row}</div>;
}