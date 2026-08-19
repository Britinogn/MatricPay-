import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EyeIcon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { formatNaira } from "../../lib/format";
import { useDeleteCampaign } from "../../hooks/useCampaigns";
import { ConfirmModal } from "../ui/ConfirmModal";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    amount: string | number;
    status: string;
    studentCount?: number;
    paymentCount?: number;
    campaignType?: string;
  };
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function CampaignCard({
  campaign,
  selected = false,
  onToggleSelect,
}: CampaignCardProps) {
  const deleteCampaign = useDeleteCampaign();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isDraft = campaign.status === "draft";
  const isSelectable = Boolean(onToggleSelect) && isDraft;

  return (
    <>
      <div className="px-4 py-4 sm:px-5 transition hover:bg-(--background)">
        <div className="flex items-start gap-3 sm:items-center">
          {isSelectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(campaign.id)}
              className="mt-1 h-5 w-5 shrink-0 accent-(--primary) sm:mt-0"
              aria-label={`Select ${campaign.title}`}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 sm:items-center">
              <p className="truncate text-sm font-medium text-(--text-primary) sm:text-base">
                {campaign.title}
              </p>

              <div className="hidden sm:flex sm:items-center sm:gap-3 sm:shrink-0">
                <span className="text-sm font-medium text-(--text-primary)">
                  {formatNaira(Number(campaign.amount) || 0)}
                </span>
                <StatusBadge status={campaign.status} />
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-(--text-muted)">
                {campaign.studentCount ?? 0} students ·{" "}
                {campaign.paymentCount ?? 0} payments
                {campaign.campaignType ? ` · ${campaign.campaignType}` : ""}
              </p>

              <div className="flex items-center gap-2 sm:hidden">
                <span className="text-sm font-semibold text-(--text-primary)">
                  {formatNaira(Number(campaign.amount) || 0)}
                </span>
                <StatusBadge status={campaign.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-(--border) pt-3 sm:mt-0 sm:border-0 sm:pt-0 sm:pl-3">
          <IconButton
            label="View"
            to={`/dashboard/campaigns/${campaign.id}`}
            icon={EyeIcon}
          />

          {isDraft && (
            <IconButton
              label="Edit"
              to={`/dashboard/campaigns/${campaign.id}/edit`}
              icon={PencilEdit02Icon}
            />
          )}

          {isDraft && (
            <button
              type="button"
              title="Delete campaign"
              onClick={() => setShowDeleteModal(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-(--text-muted) transition hover:bg-red-50 hover:text-red-600"
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete campaign?"
        message={`You are about to permanently delete “${campaign.title}”. All students added to this campaign will also be removed. This cannot be undone.`}
        confirmLabel="Delete campaign"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={deleteCampaign.isPending}
        onConfirm={() => {
          deleteCampaign.mutate(campaign.id, {
            onSuccess: () => {
              toast.success("Campaign deleted");
              setShowDeleteModal(false);
            },
            onError: (err) => {
              const axiosError = err as {
                response?: { data?: { message?: string } };
              };
              toast.error(
                axiosError.response?.data?.message || "Failed to delete campaign"
              );
            },
          });
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

function IconButton({
  label,
  to,
  icon,
}: {
  label: string;
  to: string;
  icon: typeof EyeIcon;
}) {
  return (
    <Link
      to={to}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={icon} size={18} />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
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