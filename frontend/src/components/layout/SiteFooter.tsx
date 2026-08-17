import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-(--border) bg-(--surface)">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p
            className="font-semibold text-(--text-primary)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Matric<span className="text-(--primary)">Pay</span>
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Verified student payments. Powered by Paystack.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-(--text-muted)">
          <Link to="/how-it-works" className="hover:text-(--text-primary)">
            How it works
          </Link>
          <Link to="/login" className="hover:text-(--text-primary)">
            Login
          </Link>
          <Link to="/register" className="hover:text-(--text-primary)">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}