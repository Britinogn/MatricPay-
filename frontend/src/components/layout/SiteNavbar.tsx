import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "../../hooks/useTheme";
// import logo from "../../../public/images/logo.jpg"

export function SiteNavbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          {/* <img
            src={logo}
            alt="MatricPay"
            className="h-8 w-8 object-contain"
          /> */}
          <span
            className="text-lg font-semibold tracking-tight text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-(--text-muted) md:flex">
          <a href="#features" className="hover:text-(--text-primary)">
            Features
          </a>
          <Link to="/how-it-works" className="hover:text-(--text-primary)">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme: light / dark / system */}
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
      </div>
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