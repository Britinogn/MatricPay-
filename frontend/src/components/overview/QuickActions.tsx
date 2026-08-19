import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, QrCodeIcon, AnalyticsUpIcon } from "@hugeicons/core-free-icons";

interface QuickActionsProps {
  onCopyLink: () => void;
  onShowQr: () => void;
  campaignId: string;
}

function CircleButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof Link01Icon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--surface) border border-(--border) text-(--primary) shadow-sm transition hover:bg-(--background)">
        <HugeiconsIcon icon={icon} size={22} />
      </span>
      <span className="text-xs font-medium text-(--text-primary)">{label}</span>
    </button>
  );
}

export function QuickActions({ onCopyLink, onShowQr, campaignId }: QuickActionsProps) {
  return (
    <div className="flex items-start justify-around gap-2">
      <CircleButton label="Copy Link" icon={Link01Icon} onClick={onCopyLink} />
      <CircleButton label="Show QR" icon={QrCodeIcon} onClick={onShowQr} />
      <Link to={`/dashboard/campaigns/${campaignId}`} className="flex flex-col items-center gap-1.5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--surface) border border-(--border) text-(--primary) shadow-sm transition hover:bg-(--background)">
          <HugeiconsIcon icon={AnalyticsUpIcon} size={22} />
        </span>
        <span className="text-xs font-medium text-(--text-primary)">View Report</span>
      </Link>
    </div>
  );
}