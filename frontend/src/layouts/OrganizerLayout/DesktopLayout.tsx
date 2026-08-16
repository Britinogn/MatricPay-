import { Outlet } from "react-router-dom";
import Topbar from "../../components/layout/organizer/Topbar";
import Sidebar from "../../components/layout/organizer/Sidebar";

export default function DesktopLayout() {
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <Topbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}