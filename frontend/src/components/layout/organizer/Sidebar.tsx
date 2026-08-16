import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Megaphone01Icon,
  CreditCardIcon,
  ChartIcon,
  Settings01Icon,
  HelpCircleIcon,
  Mail01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

// Everyday nav — used constantly, no section header needed.
const mainItems = [
  { label: "Home", to: "/dashboard/overview", icon: DashboardSquare01Icon, available: true },
  { label: "Campaigns", to: "/dashboard/campaigns", icon: Megaphone01Icon, available: true },
];

// Same grouping as the mobile MoreSheet's "Account" section — desktop just
// shows it directly instead of hiding it behind a popup, since there's
// room. "Soon" items match what MoreSheet marks as unbuilt, so the two
// don't disagree about what actually works.
const accountItems = [
  { label: "Payouts", to: "/dashboard/payout-account", icon: CreditCardIcon, available: true },
  { label: "Reports", to: null, icon: ChartIcon, available: false },
  { label: "Settings", to: null, icon: Settings01Icon, available: false },
];

const supportItems = [
  { label: "Help Center", to: null, icon: HelpCircleIcon, available: false },
  { label: "Contact Support", to: null, icon: Mail01Icon, available: false },
  { label: "About MatricPay", to: null, icon: InformationCircleIcon, available: false },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-full md:w-56 flex-col bg-(--surface) md:border-r md:border-(--border)">
      <nav className="flex flex-col gap-6 p-3">
        <SidebarSection items={mainItems} onNavigate={onNavigate} />
        <SidebarSection title="Account" items={accountItems} onNavigate={onNavigate} />
        <SidebarSection title="Support" items={supportItems} onNavigate={onNavigate} />
      </nav>

      <div className="mt-auto p-3 hidden md:block">
        <div className="rounded-xl border border-(--border) bg-(--background) p-3">
          <p className="text-xs text-(--text-muted)">Need help?</p>
          <p className="mt-1 text-sm font-medium text-(--text-primary)">
            Contact support
          </p>
        </div>
      </div>
    </aside>
  );
}

interface SidebarItem {
  label: string;
  to: string | null;
  icon: typeof DashboardSquare01Icon;
  available: boolean;
}

interface SidebarSectionProps {
  title?: string;
  items: SidebarItem[];
  onNavigate?: () => void;
}

function SidebarSection({ title, items, onNavigate }: SidebarSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      {title && (
        <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-(--text-muted)">
          {title}
        </p>
      )}
      {items.map((item) =>
        item.available && item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-(--primary) text-white"
                  : "text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
              }`
            }
          >
            <HugeiconsIcon icon={item.icon} size={18} />
            {item.label}
          </NavLink>
        ) : (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--text-muted) opacity-60"
          >
            <HugeiconsIcon icon={item.icon} size={18} />
            <span className="flex-1">{item.label}</span>
            <span className="rounded-full bg-(--background) px-2 py-0.5 text-[10px] font-medium">
              Soon
            </span>
          </div>
        )
      )}
    </div>
  );
}