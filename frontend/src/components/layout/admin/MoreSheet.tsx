import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  File01Icon,
  WebhookIcon,
  Logout01Icon,
  ArrowRight01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../../hooks";

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const logItems = [
  { label: "Audit", to: "/admin/audit", icon: File01Icon, available: true },
  { label: "Webhooks", to: "/admin/webhooks", icon: WebhookIcon, available: true },
];

const accountItems = [
    { label: "Settings", icon: Settings01Icon, to: null, available: false },
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
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-(--surface) shadow-2xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-(--border)" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2
            id="more-sheet-title"
            className="text-xl font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            More
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-(--text-muted) hover:bg-(--background)"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <div className="mx-5 mb-6 flex items-center gap-3.5 rounded-2xl bg-(--primary) px-4 py-4 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">
              {user?.fullName ?? "Admin"}
            </p>
            <p className="text-xs capitalize text-white/70">{user?.role ?? "admin"}</p>
          </div>
        </div>

        <Section title="Logs">
          {logItems.map((item, index) => (
            <MoreRow
              key={item.label}
              {...item}
              isLast={index === logItems.length - 1}
              onNavigate={onClose}
            />
          ))}
        </Section>

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

        <div className="mt-2 px-5">
          <button
            type="button"
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 px-5">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        {title}
      </p>
      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--background)">
        {children}
      </div>
    </div>
  );
}

function MoreRow({
  label,
  icon,
  to,
  available,
  isLast,
  onNavigate,
}: {
  label: string;
  icon: typeof File01Icon;
  to: string | null;
  available: boolean;
  isLast: boolean;
  onNavigate: () => void;
}) {
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
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-(--text-muted)" />
      ) : (
        <span className="rounded-full bg-(--surface) px-2.5 py-0.5 text-[10px] font-medium text-(--text-muted)">
          Soon
        </span>
      )}
    </div>
  );

  if (available && to) {
    return (
      <Link to={to} onClick={onNavigate} className="block">
        {row}
      </Link>
    );
  }

  return <div className="cursor-default">{row}</div>;
}