import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCampaign, useUpdateCampaign } from "../../hooks/useCampaigns";
import {
  CampaignForm,
  type CampaignFormValues,
} from "../../components/organizer/CampaignForm";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const updateCampaign = useUpdateCampaign();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-(--text-muted)">Loading campaign…</p>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-(--text-muted)">Campaign not found.</p>
      </div>
    );
  }

  if (campaign.status !== "draft") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-sm text-(--text-muted)">
          Only draft campaigns can be edited.
        </p>
        <button
          onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
          className="text-sm font-medium text-(--primary)"
        >
          Back to campaign
        </button>
      </div>
    );
  }

  const onSubmit = async (values: CampaignFormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        amount: values.amount,
        amountType: values.amountType,
        campaignType: values.campaignType,
        expiresAt: values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : null,
      };

      await updateCampaign.mutateAsync({ id: campaign.id, payload });
      toast.success("Campaign updated");
      navigate(`/dashboard/campaigns/${campaign.id}`);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to update campaign"
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Edit Campaign
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">{campaign.title}</p>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
        <CampaignForm
          defaultValues={{
            title: campaign.title,
            description: campaign.description ?? "",
            amount: Number(campaign.amount),
            amountType: campaign.amountType as "fixed" | "minimum",
            campaignType: campaign.campaignType as "restricted" | "open",
            expiresAt: campaign.expiresAt
              ? new Date(campaign.expiresAt).toISOString().slice(0, 16)
              : "",
          }}
          submitLabel="Save changes"
          isSubmitting={updateCampaign.isPending}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}