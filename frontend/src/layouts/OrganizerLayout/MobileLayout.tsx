import { Outlet, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { useCurrentUser } from "../../hooks";
import BottomTabBar from "../../components/layout/organizer/BottomTabBar";

export default function MobileLayout() {
  const { data: user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/">
            <span
              className="text-lg font-semibold tracking-tight text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Matric<span className="text-(--primary)">Pay</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-1.5 text-(--text-muted)">
              <HugeiconsIcon icon={Notification03Icon} size={20} />
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-sm font-medium text-white">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  );
}