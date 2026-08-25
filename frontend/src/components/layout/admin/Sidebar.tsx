import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Megaphone01Icon,
  File01Icon,
  WebhookIcon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../../hooks";

const mainItems = [
  { label: "Overview", to: "/admin/overview", icon: DashboardSquare01Icon, available: true },
  { label: "Organizers", to: "/admin/organizers", icon: UserGroupIcon, available: true },
  { label: "Campaigns", to: "/admin/campaigns", icon: Megaphone01Icon, available: true },
];

const moreItems = [
  { label: "Audit", to: "/admin/audit", icon: File01Icon, available: true },
  { label: "Webhooks", to: "/admin/webhooks", icon: WebhookIcon, available: true },
];

const accountItems = [
    { label: "Settings", icon: Settings01Icon, to: null, available: false },
];

export default function Sidebar() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <>
      <div className="border-b border-(--border) px-5 py-5">
        <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Matric<span className="text-(--primary)">Pay</span>
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-(--text-muted)">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? "bg-(--primary)/10 text-(--primary)"
                  : "text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
              }`
            }
          >
            <HugeiconsIcon icon={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}

        <p className="px-3 pt-4 pb-1 text-[10px] font-medium uppercase tracking-wide text-(--text-muted)">
          Logs
        </p>
        {moreItems.map((item) =>
          item.available && item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-(--text-muted)"
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              {item.label}
            </NavLink>
          ) : (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-(--text-muted) opacity-60"
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px]">Soon</span>
            </div>
          )
        )}

        <p className="px-3 pt-4 pb-1 text-[10px] font-medium uppercase tracking-wide text-(--text-muted)">
          Account
        </p>
        
        {accountItems.map((item) =>
          item.available && item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              {item.label}
            </NavLink>
          ) : (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-(--text-muted) opacity-60"
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px]">Soon</span>
            </div>
          )
        )}
      </nav>

      <div className="border-t border-(--border) p-4">
        <p className="truncate text-sm font-medium">{user?.fullName}</p>
        <p className="truncate text-xs text-(--text-muted)">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-(--text-muted) hover:bg-red-50 hover:text-red-600"
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} />
          Log out
        </button>
      </div>
    </>
  );
}