import { Outlet } from "react-router-dom";
import { SiteNavbar } from "../components/layout/SiteNavbar";
import { SiteFooter } from "../components/layout/SiteFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary)">
      <SiteNavbar />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}