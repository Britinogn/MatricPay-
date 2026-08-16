import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Megaphone01Icon,
  // UserMultiple02Icon,
  CreditCardIcon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";

// const tabs = [
//   { label: "Home", to: "/", icon: Home01Icon },
//   { label: "Campaigns", to: "/campaigns", icon: Megaphone01Icon },
//   { label: "Students", to: "/students", icon: UserMultiple02Icon },
//   { label: "Payouts", to: "/payout-account", icon: CreditCardIcon },
//   { label: "More", to: "/more", icon: MoreHorizontalCircle01Icon },
// ];
const tabs = [
  { label: "Home", to: "/dashboard/overview", icon: Home01Icon },
  { label: "Campaigns", to: "/dashboard/campaigns", icon: Megaphone01Icon },
  { label: "Payouts", to: "/dashboard/payout-account", icon: CreditCardIcon },
  { label: "More", to: "/dashboard/more", icon: MoreHorizontalCircle01Icon },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-(--border) bg-(--surface) md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
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
      </div>
    </nav>
  );
}