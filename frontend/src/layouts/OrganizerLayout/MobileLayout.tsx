import { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../hooks";
import { useTheme } from "../../hooks/useTheme";
import BottomTabBar from "../../components/layout/organizer/BottomTabBar";

export default function MobileLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      {/* Mobile Header */}
      <header
        className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/dashboard/overview">
            <span
              className="text-lg font-semibold tracking-tight text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Matric<span className="text-(--primary)">Pay</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notification button with badge placeholder */}
            <button
              className="relative rounded-full p-2 text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary) transition"
              aria-label="Notifications"
            >
              <HugeiconsIcon icon={Notification03Icon} size={20} />
              {/* Static badge for demo; replace with real count */}
              {/* <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                3
              </span> */}
            </button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-(--primary) text-sm font-medium text-white shadow-sm"
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-xl z-50">
                  {/* User info */}
                  <div className="border-b border-(--border) px-4 py-3">
                    <p className="truncate text-sm font-medium text-(--text-primary)">
                      {user?.fullName}
                    </p>
                    <p className="text-xs capitalize text-(--text-muted)">
                      {user?.role}
                    </p>
                  </div>

                  {/* Theme */}
                  <div className="px-3 py-3">
                    <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">
                      Theme
                    </p>
                    <div className="flex gap-1 rounded-xl bg-(--background) p-1">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                          theme === "light"
                            ? "bg-(--primary) text-white"
                            : "text-(--text-muted) hover:text-(--text-primary)"
                        }`}
                      >
                        <HugeiconsIcon icon={Sun03Icon} size={14} />
                        Light
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                          theme === "dark"
                            ? "bg-(--primary) text-white"
                            : "text-(--text-muted) hover:text-(--text-primary)"
                        }`}
                      >
                        <HugeiconsIcon icon={Moon02Icon} size={14} />
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                          theme === "system"
                            ? "bg-(--primary) text-white"
                            : "text-(--text-muted) hover:text-(--text-primary)"
                        }`}
                      >
                        <HugeiconsIcon icon={ComputerIcon} size={14} />
                        Auto
                      </button>
                    </div>
                  </div>

                  {/* Settings */}
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-(--text-primary) hover:bg-(--background) transition"
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                    Settings
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 border-t border-(--border) px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-28">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  );
}