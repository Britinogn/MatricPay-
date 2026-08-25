import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Megaphone01Icon,
  CreditCardIcon,
  Money01Icon, // or Invoice01Icon / Payment01Icon 
  ChartIcon,
  Settings01Icon,
  HelpCircleIcon,
  Mail01Icon,
  InformationCircleIcon,
  Logout01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

const mainItems = [
  { label: "Home", to: "/dashboard/overview", icon: DashboardSquare01Icon, available: true },
  { label: "Campaigns", to: "/dashboard/campaigns", icon: Megaphone01Icon, available: true },
  { label: "Payments", to: "/dashboard/payments", icon: Money01Icon, available: true },
  // { label: "Reports", to: "/dashboard/reports", icon: ChartIcon, available: true },
];

const accountItems = [
  { label: "Payouts", to: "/dashboard/payout-account", icon: CreditCardIcon, available: true },
  { label: "Reports", to: "/dashboard/reports", icon: ChartIcon, available: true },
  { label: "Activity", to: "/dashboard/activity", icon: Clock01Icon, available: true },
  { label: "Settings", to: null, icon: Settings01Icon, available: false },
];

const supportItems = [
  { label: "Help Center", to: null, icon: HelpCircleIcon, available: false },
  { label: "Contact Support", to: null, icon: Mail01Icon, available: false },
  { label: "About MatricPay", to: null, icon: InformationCircleIcon, available: false },
];

interface SidebarProps {
  onNavigate?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="flex flex-col h-full w-64 bg-(--surface) border-r border-(--border) md:fixed md:top-0 md:left-0 md:h-screen z-40">
      {/* Logo / Brand */}
      <div className="px-6 pt-6 pb-5 border-b border-(--border)">
        <span
          className="text-xl font-semibold tracking-tight text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Matric<span className="text-(--primary)">Pay</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarSection items={mainItems} onNavigate={onNavigate} />
        <div className="my-6 border-t border-(--border)" />
        <SidebarSection title="Account" items={accountItems} onNavigate={onNavigate} />
        <div className="my-6 border-t border-(--border)" />
        <SidebarSection title="Support" items={supportItems} onNavigate={onNavigate} />
      </nav>

      {/* Bottom: Logout & help */}
      <div className="px-4 pb-6 space-y-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--text-muted) hover:bg-red-50 hover:text-red-600 transition"
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} />
          Log out
        </button>
        <div className="rounded-xl border border-(--border) bg-(--background) p-3">
          <p className="text-xs text-(--text-muted)">Need help?</p>
          <p className="mt-1 text-sm font-medium text-(--text-primary)">Contact support</p>
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
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
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
                  ? "bg-(--primary) text-white shadow-sm"
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
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--text-muted) opacity-60 cursor-default"
          >
            <HugeiconsIcon icon={item.icon} size={18} />
            <span className="flex-1">{item.label}</span>
            <span className="rounded-full bg-(--background) px-2 py-0.5 text-[10px] font-semibold">
              Soon
            </span>
          </div>
        )
      )}
    </div>
  );
}