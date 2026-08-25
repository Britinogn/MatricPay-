import { useMediaQuery } from "../../hooks/useMediaQuery";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function AdminLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}