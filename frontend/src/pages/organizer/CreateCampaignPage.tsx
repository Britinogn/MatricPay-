import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateCampaign } from "../../hooks/useCampaigns";
import { CampaignForm, type CampaignFormValues } from "../../components/organizer/CampaignForm";
import { BackLink } from "../../components/ui/BackLink";

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();

  const onSubmit = async (values: CampaignFormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        netAmount: values.netAmount,
        amountType: values.amountType,
        campaignType: values.campaignType,
        currency: "NGN",
        expiresAt: values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : undefined,
      };

      const campaign = await createCampaign.mutateAsync(payload);

      if (!campaign?.id) {
        toast.success("Campaign created");
        navigate("/dashboard/campaigns");
        return;
      }

      toast.success("Campaign created");
      navigate(`/dashboard/campaigns/${campaign.id}`);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to create campaign"
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <BackLink to="/dashboard/campaigns" label="Back to campaigns" />
      {/* <div className="flex items-center gap-3">
        <Link
          to="/dashboard/campaigns"
          className="text-sm text-(--text-muted) hover:text-(--text-primary)"
        >
          ← Back to campaigns
        </Link>
      </div> */}

      <div>
        <h1
          className="text-2xl font-semibold text-(--text-primary)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New Campaign
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Create a new payment campaign. It will start as a draft.
        </p>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
        <CampaignForm
          submitLabel="Create campaign"
          isSubmitting={createCampaign.isPending}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}