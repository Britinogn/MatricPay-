import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../../hooks";
import { useTheme } from "../../../hooks/useTheme";
import Sidebar from "./Sidebar";

export default function Topbar() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center rounded-lg p-2 text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary) transition"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <span
                className="text-lg font-semibold tracking-tight text-(--text-primary)"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Matric<span className="text-(--primary)">Pay</span>
              </span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center rounded-lg border border-(--border) p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`rounded-md p-1.5 transition ${
                  theme === "light"
                    ? "bg-(--primary) text-white"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                }`}
                title="Light"
              >
                <HugeiconsIcon icon={Sun03Icon} size={15} />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`rounded-md p-1.5 transition ${
                  theme === "dark"
                    ? "bg-(--primary) text-white"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                }`}
                title="Dark"
              >
                <HugeiconsIcon icon={Moon02Icon} size={15} />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`rounded-md p-1.5 transition ${
                  theme === "system"
                    ? "bg-(--primary) text-white"
                    : "text-(--text-muted) hover:text-(--text-primary)"
                }`}
                title="System"
              >
                <HugeiconsIcon icon={ComputerIcon} size={15} />
              </button>
            </div>

            {/* User */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-(--text-primary)">
                {user?.fullName}
              </span>
              <span className="text-xs text-(--text-muted) capitalize">
                {user?.role}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--text-muted) hover:border-red-500/40 hover:text-red-500 transition"
              title="Logout"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 bg-(--surface) border-r border-(--border) shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-(--border)">
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Matric<span className="text-(--primary)">Pay</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-(--text-muted) hover:bg-(--background)"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}