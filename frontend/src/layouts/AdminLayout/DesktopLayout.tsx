import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/admin/Sidebar";

export default function DesktopLayout() {
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-(--border) bg-(--surface)">
        <Sidebar />
      </aside>
      <main className="pl-60">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}