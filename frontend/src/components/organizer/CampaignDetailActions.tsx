import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  Share08Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { useUpdateCampaignStatus } from "../../hooks/useCampaigns";

interface CampaignDetailActionsProps {
  campaign: {
    id: string;
    title: string;
    status: string;
    paymentLink?: string;
  };
}

export function CampaignDetailActions({ campaign }: CampaignDetailActionsProps) {
  const updateStatus = useUpdateCampaignStatus();
  const [confirmClose, setConfirmClose] = useState(false);

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
        onSuccess: () => {
          toast.success("Campaign activated");
        },
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

  const handleClose = () => {
    if (!confirmClose) {
      setConfirmClose(true);
      return;
    }

    updateStatus.mutate(
      { id: campaign.id, status: "closed" },
      {
        onSuccess: () => {
          toast.success("Campaign closed");
          setConfirmClose(false);
        },
        onError: (err: unknown) => {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "Could not close campaign"
          );
          setConfirmClose(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
      >
        <HugeiconsIcon icon={Share08Icon} size={16} />
        Share
      </button>

      {/* Edit — draft only */}
      {isDraft && (
        <Link
          to={`/dashboard/campaigns/${campaign.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
          Edit
        </Link>
      )}

      {/* Activate — draft only */}
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

      {/* Close — active only */}
      {isActive && (
        <button
          type="button"
          onClick={handleClose}
          disabled={updateStatus.isPending}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition disabled:opacity-60 ${
            confirmClose
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-(--border) text-(--text-muted) hover:border-red-400 hover:text-red-600"
          }`}
        >
          <HugeiconsIcon icon={CancelCircleIcon} size={16} />
          {confirmClose ? "Click again to confirm" : "Close"}
        </button>
      )}

      {isClosed && (
        <span className="rounded-full bg-(--border) px-3 py-1 text-xs font-medium text-(--text-muted)">
          Closed
        </span>
      )}
    </div>
  );
}