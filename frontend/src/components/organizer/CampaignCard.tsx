import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, PencilEdit02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { formatNaira } from "../../lib/format";
import { useUpdateCampaignStatus } from "../../hooks/useCampaigns";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    amount: string | number;
    status: string;
    studentCount?: number;
    paymentCount?: number;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [confirmingClose, setConfirmingClose] = useState(false);
  const updateStatus = useUpdateCampaignStatus();

  // There is no true "delete" on the backend — campaigns are referenced by
  // payments, so removing one outright would orphan payment/audit records.
  // This button closes the campaign instead (same as the organizer's own
  // "close campaign" action elsewhere), which is the actual safe equivalent.
  function handleClose() {
    if (!confirmingClose) {
      setConfirmingClose(true);
      return;
    }
    updateStatus.mutate(
      { id: campaign.id, status: "closed" },
      { onSettled: () => setConfirmingClose(false) }
    );
  }

  const canClose = campaign.status !== "closed";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-(--background)">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-(--text-primary)">
          {campaign.title}
        </p>
        <p className="mt-0.5 text-xs text-(--text-muted)">
          {campaign.studentCount ?? 0} students · {campaign.paymentCount ?? 0} payments
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-medium text-(--text-primary)">
          {formatNaira(Number(campaign.amount) || 0)}
        </span>
        <StatusBadge status={campaign.status} />

        <div className="flex items-center gap-1 border-l border-(--border) pl-3">
          <IconButton label="View" to={`/dashboard/campaigns/${campaign.id}`} icon={EyeIcon} />
          {campaign.status === "draft" && (
            <IconButton
              label="Edit"
              to={`/dashboard/campaigns/${campaign.id}/edit`}
              icon={PencilEdit02Icon}
            />
          )}
          {canClose && (
            <button
              type="button"
              onClick={handleClose}
              disabled={updateStatus.isPending}
              title={confirmingClose ? "Click again to confirm" : "Close campaign"}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                confirmingClose
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "text-(--text-muted) hover:bg-(--background) hover:text-red-600"
              }`}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface IconButtonProps {
  label: string;
  to: string;
  icon: typeof EyeIcon;
}

function IconButton({ label, to, icon }: IconButtonProps) {
  return (
    <Link
      to={to}
      title={label}
      onClick={(e) => e.stopPropagation()}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={icon} size={16} />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  // Built from the app's own tokens (--primary / --accent / --text-muted),
  // not Tailwind's raw palette. Tailwind's dark: variant follows the OS's
  // prefers-color-scheme by default, not this app's own .dark class toggle
  // — mixing the two caused badges to flip to dark colors even while the
  // rest of the page correctly stayed in light mode, which is what made
  // this unreadable.
  const styles: Record<string, string> = {
    active: "bg-(--primary)/10 text-(--primary)",
    draft: "bg-(--accent)/10 text-(--accent)",
    closed: "bg-(--border) text-(--text-muted)",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
        styles[status] || styles.closed
      }`}
    >
      {status}
    </span>
  );
}