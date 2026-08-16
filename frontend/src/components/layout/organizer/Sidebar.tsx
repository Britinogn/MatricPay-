import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  PlusSignIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";

const navItems = [
  {
    label: "Campaigns",
    to: "/",
    icon: DashboardSquare01Icon,
  },
  {
    label: "New Campaign",
    to: "/campaigns/new",
    icon: PlusSignIcon,
  },
  {
    label: "Payout Account",
    to: "/payout-account",
    icon: CreditCardIcon,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-full md:w-56 flex-col bg-(--surface) md:border-r md:border-(--border)">
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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
        ))}
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