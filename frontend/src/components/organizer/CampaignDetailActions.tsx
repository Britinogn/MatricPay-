import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  Share08Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import {
  useDeleteCampaign,
  useUpdateCampaignStatus,
} from "../../hooks/useCampaigns";
import { ConfirmModal } from "../ui/ConfirmModal";

interface CampaignDetailActionsProps {
  campaign: {
    id: string;
    title: string;
    status: string;
    paymentLink?: string;
  };
}

export function CampaignDetailActions({ campaign }: CampaignDetailActionsProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const isDraft = campaign.status === "draft";
  const isActive = campaign.status === "active";
  const isClosed = campaign.status === "closed";

  const handleShare = async () => {
    if (!campaign.paymentLink) {
      toast.error("No payment link available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign.title,
          url: campaign.paymentLink,
        });
      } else {
        await navigator.clipboard.writeText(campaign.paymentLink);
        toast.success("Payment link copied");
      }
    } catch {
      // user cancelled share
    }
  };

  const handleActivate = () => {
    updateStatus.mutate(
      { id: campaign.id, status: "active" },
      {
        onSuccess: () => toast.success("Campaign activated"),
        onError: (err: unknown) => {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Could not activate campaign. Check payout account and students."
          );
        },
      }
    );
  };

  const handleCloseConfirm = () => {
    updateStatus.mutate(
      { id: campaign.id, status: "closed" },
      {
        onSuccess: () => {
          toast.success("Campaign closed");
          setShowCloseModal(false);
        },
        onError: (err: unknown) => {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "Could not close campaign"
          );
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => {
        toast.success("Campaign deleted");
        setShowDeleteModal(false);
        navigate("/dashboard/campaigns");
      },
      onError: (err: unknown) => {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "Failed to delete campaign"
        );
      },
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Share08Icon} size={16} />
          Share
        </button>

        {isDraft && (
          <Link
            to={`/dashboard/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
            Edit
          </Link>
        )}

        {isDraft && (
          <button
            type="button"
            onClick={handleActivate}
            disabled={updateStatus.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-3 py-2 text-sm font-medium text-white transition hover:bg-(--primary-hover) disabled:opacity-60"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
            {updateStatus.isPending ? "Activating..." : "Activate"}
          </button>
        )}

        {isDraft && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteCampaign.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            Delete
          </button>
        )}

        {isActive && (
          <button
            type="button"
            onClick={() => setShowCloseModal(true)}
            disabled={updateStatus.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text-muted) transition hover:border-red-400 hover:text-red-600 disabled:opacity-60"
          >
            <HugeiconsIcon icon={CancelCircleIcon} size={16} />
            Close
          </button>
        )}

        {isClosed && (
          <span className="rounded-full bg-(--border) px-3 py-1 text-xs font-medium text-(--text-muted)">
            Closed
          </span>
        )}
      </div>

      <ConfirmModal
        isOpen={showCloseModal}
        title="Close campaign?"
        message={`“${campaign.title}” will stop accepting payments. Students who haven’t paid will no longer be able to pay through this link. You can’t reopen it later.`}
        confirmLabel="Close campaign"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={updateStatus.isPending}
        onConfirm={handleCloseConfirm}
        onCancel={() => setShowCloseModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete campaign?"
        message={`You are about to permanently delete “${campaign.title}”. All students added to this campaign will also be removed. This cannot be undone.`}
        confirmLabel="Delete campaign"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={deleteCampaign.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}