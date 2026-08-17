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
import {
  useDeleteCampaign,
} from "../../hooks/useCampaigns";
import { ConfirmModal } from "../ui/ConfirmModal";

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
  const deleteCampaign = useDeleteCampaign();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isDraft = campaign.status === "draft";
  
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-(--background)">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--text-primary)">
            {campaign.title}
          </p>
          {(campaign.studentCount != null || campaign.paymentCount != null) && (
            <p className="mt-0.5 text-xs text-(--text-muted)">
              {campaign.studentCount ?? 0} students ·{" "}
              {campaign.paymentCount ?? 0} payments
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-medium text-(--text-primary)">
            {formatNaira(Number(campaign.amount) || 0)}
          </span>
          <StatusBadge status={campaign.status} />

          <div className="ml-1 flex items-center gap-1 border-l border-(--border) pl-2">
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

            {/* Draft → real delete */}
            {isDraft && (
              <button
                type="button"
                title="Delete campaign"
                onClick={() => setShowDeleteModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition hover:bg-red-50 hover:text-red-600"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            )}

            {/* Active → close only */}
          </div>
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
            onError: (err: unknown) => {
              const axiosError = err as {
                response?: { data?: { message?: string } };
              };
              toast.error(
                axiosError.response?.data?.message ||
                  "Failed to delete campaign"
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
      className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={icon} size={16} />
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