import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook02Icon,
  TwitterIcon,
  InstagramIcon,
  Linkedin02Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

export function SiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-(--border) bg-(--surface)">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand + Long Note */}
          <div className="md:col-span-1">
            <p
              className="font-semibold text-xl text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Matric<span className="text-(--primary)">Pay</span>
            </p>
            <p className="mt-3 text-sm text-(--text-muted leading-relaxed">
              MatricPay is a secure payment platform built for Nigerian tertiary institutions. We help organizers create payment campaigns, track collections in real time, and verify student payments without the usual administrative stress. Powered by Paystack, we ensure every transaction is safe, transparent, and easy to reconcile.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-(--text-primary) mb-3">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2 text-sm text-(--text-muted)">
              <Link to="/how-it-works" className="hover:text-(--text-primary)">
                How it works
              </Link>
              <Link to="/login" className="hover:text-(--text-primary)">
                Login
              </Link>
              <Link to="/register" className="hover:text-(--text-primary)">
                Register
              </Link>
              <Link to="/" className="hover:text-(--text-primary)">
                Home
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-(--text-primary) mb-3">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--background) hover:text-(--primary)"
              >
                <HugeiconsIcon icon={Facebook02Icon} size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--background) hover:text-(--primary)"
              >
                <HugeiconsIcon icon={TwitterIcon} size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--background) hover:text-(--primary)"
              >
                <HugeiconsIcon icon={InstagramIcon} size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) text-(--text-muted) transition hover:bg-(--background) hover:text-(--primary)"
              >
                <HugeiconsIcon icon={Linkedin02Icon} size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row: copyright + back to top */}
        <div className="mt-8 flex flex-col gap-4 border-t border-(--border) pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-(--text-muted">
            © {new Date().getFullYear()} MatricPay. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary) sm:self-auto"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}