import { useMediaQuery } from "../../hooks/useMediaQuery";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function OrganizerLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}