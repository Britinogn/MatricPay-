import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "../../hooks/useTheme";

export function SiteNavbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className="text-lg font-semibold tracking-tight text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-(--text-muted) md:flex">
          <a href="#features" className="hover:text-(--text-primary)">
            Features
          </a>
          <NavLink
            to="/how-it-works"
            className={({ isActive }) =>
              `hover:text-(--text-primary) ${
                isActive ? "text-(--primary) font-medium" : ""
              }`
            }
          >
            How it works
          </NavLink>
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 sm:flex md:gap-3">
          {/* Theme toggle */}
          <div className="flex items-center rounded-xl border border-(--border) bg-(--surface) p-1">
            <ThemeButton
              active={theme === "light"}
              label="Light"
              icon={Sun03Icon}
              onClick={() => setTheme("light")}
            />
            <ThemeButton
              active={theme === "dark"}
              label="Dark"
              icon={Moon02Icon}
              onClick={() => setTheme("dark")}
            />
            <ThemeButton
              active={theme === "system"}
              label="System"
              icon={ComputerIcon}
              onClick={() => setTheme("system")}
            />
          </div>

          <Link
            to="/login"
            className="rounded-xl px-3 py-2 text-sm text-(--text-muted) hover:text-(--text-primary)"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary-hover)"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-(--text-muted) hover:bg-(--surface) sm:hidden"
          aria-label="Toggle menu"
        >
          <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu01Icon} size={22} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-(--border) bg-(--surface) px-4 pb-4 pt-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background)"
            >
              Features
            </a>
            <NavLink
              to="/how-it-works"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-(--primary) text-white"
                    : "text-(--text-primary) hover:bg-(--background)"
                }`
              }
            >
              How it works
            </NavLink>
          </nav>

          {/* Theme options */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-(--text-muted)">Theme</span>
            <div className="flex items-center rounded-xl border border-(--border) bg-(--background) p-1">
              <ThemeButton
                active={theme === "light"}
                label="Light"
                icon={Sun03Icon}
                onClick={() => setTheme("light")}
              />
              <ThemeButton
                active={theme === "dark"}
                label="Dark"
                icon={Moon02Icon}
                onClick={() => setTheme("dark")}
              />
              <ThemeButton
                active={theme === "system"}
                label="System"
                icon={ComputerIcon}
                onClick={() => setTheme("system")}
              />
            </div>
          </div>

          {/* Auth buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-(--border) px-4 py-2.5 text-center text-sm font-medium text-(--text-primary) hover:bg-(--background)"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-(--primary) px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-(--primary-hover)"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function ThemeButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Sun03Icon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        active
          ? "bg-(--primary) text-white"
          : "text-(--text-muted) hover:text-(--text-primary)"
      }`}
    >
      <HugeiconsIcon icon={icon} size={16} />
    </button>
  );
}