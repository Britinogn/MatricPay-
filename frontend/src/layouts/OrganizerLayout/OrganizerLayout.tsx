import { Outlet } from "react-router-dom";
import Topbar from "../../components/layout/organizer/Topbar";
import Sidebar from "../../components/layout/organizer/Sidebar";

export default function OrganizerLayout() {
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <Topbar />

      <div className="flex">
        {/* Desktop sidebar only */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}