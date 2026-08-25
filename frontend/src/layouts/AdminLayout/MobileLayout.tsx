import { Outlet, Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks";
import BottomTabBar from "../../components/layout/admin/BottomTabBar";

export default function MobileLayout() {
  const { data: user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/admin/overview">
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Matric<span className="text-(--primary)">Pay</span>
              <span className="ml-1 text-xs font-medium text-(--text-muted)">Admin</span>
            </span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-sm font-medium text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-24">
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  );
}