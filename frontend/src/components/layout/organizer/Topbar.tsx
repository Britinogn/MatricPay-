import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser, useLogout } from "../../../hooks";
import { useTheme } from "../../../hooks/useTheme";

export default function Topbar() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left - Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className="text-lg font-semibold tracking-tight text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
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
              <HugeiconsIcon icon={Sun03Icon} size={16} />
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
              <HugeiconsIcon icon={Moon02Icon} size={16} />
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
              <HugeiconsIcon icon={ComputerIcon} size={16} />
            </button>
          </div>

          {/* User info */}
          <div className="hidden sm:flex flex-col items-end">
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
            className="flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-sm text-(--text-muted) hover:border-red-500/40 hover:text-red-500 transition"
            title="Logout"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}