import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Megaphone01Icon,
  CreditCardIcon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import MoreSheet from "./MoreSheet";

const tabs = [
  { label: "Home", to: "/dashboard/overview", icon: Home01Icon },
  { label: "Campaigns", to: "/dashboard/campaigns", icon: Megaphone01Icon },
  { label: "Payments", to: "/dashboard/payments", icon: CreditCardIcon },
  // { label: "Payouts", to: "/dashboard/payout-account", icon: CreditCardIcon },
];

export default function BottomTabBar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-(--border) bg-(--surface) md:hidden">
        <div className="flex h-16 items-center justify-around">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-(--primary)" : "text-(--text-muted)"
                }`
              }
            >
              <HugeiconsIcon icon={tab.icon} size={22} />
              <span>{tab.label}</span>
            </NavLink>
          ))}

          {/* Not a route — opens the sheet in place, same page underneath */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMoreOpen}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
              isMoreOpen ? "text-(--primary)" : "text-(--text-muted)"
            }`}
          >
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}