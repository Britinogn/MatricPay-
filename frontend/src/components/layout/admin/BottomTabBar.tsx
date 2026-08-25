import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Megaphone01Icon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import MoreSheet from "./MoreSheet";

const tabs = [
  { label: "Overview", to: "/admin/overview", icon: DashboardSquare01Icon },
  { label: "Organizers", to: "/admin/organizers", icon: UserGroupIcon },
  { label: "Campaigns", to: "/admin/campaigns", icon: Megaphone01Icon },
];

export default function BottomTabBar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--border) bg-(--surface) md:hidden">
        <div className="flex h-16 items-center justify-around">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? "text-(--primary)" : "text-(--text-muted)"
                }`
              }
            >
              <HugeiconsIcon icon={tab.icon} size={22} />
              <span>{tab.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
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