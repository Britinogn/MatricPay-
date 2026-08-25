import { NavLink, Outlet } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Megaphone01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../hooks";

const nav = [
  { label: "Overview", to: "/admin/overview", icon: DashboardSquare01Icon },
  { label: "Organizers", to: "/admin/organizers", icon: UserGroupIcon },
  { label: "Campaigns", to: "/admin/campaigns", icon: Megaphone01Icon },
];

export default function AdminLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:border-(--border) md:bg-(--surface)">
        <div className="border-b border-(--border) px-5 py-5">
          <p
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-(--text-muted)">
            Admin
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
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
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--border) bg-(--surface) px-4 md:hidden">
          <span
            className="font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span> Admin
          </span>
          <button type="button" onClick={() => logout()} className="text-sm text-(--text-muted)">
            Log out
          </button>
        </header>

        <main className="px-4 py-5 pb-24 md:px-8 md:py-8">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-(--border) bg-(--surface) md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? "text-(--primary)" : "text-(--text-muted)"
                }`
              }
            >
              <HugeiconsIcon icon={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}