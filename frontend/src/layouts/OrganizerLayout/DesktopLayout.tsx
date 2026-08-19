import { Outlet } from "react-router-dom";
import Topbar from "../../components/layout/organizer/Topbar";
import Sidebar from "../../components/layout/organizer/Sidebar";

export default function DesktopLayout() {
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Content wrapper offset by sidebar width on desktop */}
      <div className="md:ml-64">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}