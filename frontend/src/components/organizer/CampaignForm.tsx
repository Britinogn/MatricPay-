import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const campaignSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().max(1000).optional().or(z.literal("")),
    // amount: z
    //   .number()
    //   .positive("Amount must be greater than zero"),
    netAmount: z
      .number()
      .positive("Amount must be greater than zero"),
    amountType: z.enum(["fixed", "minimum"]),
    campaignType: z.enum(["restricted", "open"]),
    expiresAt: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.campaignType === "restricted" && data.amountType !== "fixed") {
        return false;
      }
      return true;
    },
    {
      message: "Restricted campaigns must use a fixed amount",
      path: ["amountType"],
    }
  );

export type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  defaultValues?: Partial<CampaignFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: CampaignFormValues) => void;
}

export function CampaignForm({
  defaultValues,
  submitLabel = "Save campaign",
  isSubmitting = false,
  onSubmit,
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      netAmount: undefined as unknown as number,
      amountType: "fixed",
      campaignType: "restricted",
      expiresAt: "",
      ...defaultValues,
    },
  });

  const campaignType = watch("campaignType");

  useEffect(() => {
    if (campaignType === "restricted") {
      setValue("amountType", "fixed");
    }
  }, [campaignType, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Title
        </label>
        <input
          {...register("title")}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
          placeholder="e.g. Faculty Dues 2026"
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Description <span className="text-(--text-muted)">(optional)</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
          placeholder="What is this campaign for?"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Net Amount (organizer receives) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Amount you want to receive (NGN)
        </label>
        <input
          type="number"
          step="100"
          {...register("netAmount", { valueAsNumber: true })}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
          placeholder="5000"
        />
        {errors.netAmount && (
          <p className="mt-1.5 text-xs text-red-500">{errors.netAmount.message}</p>
        )}
        <p className="mt-1.5 text-xs text-(--text-muted)">
          This is the exact amount that will settle to your bank account. Students
          will pay a slightly higher amount to cover processing fees.
        </p>
      </div>

      {/* Campaign type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Campaign type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm">
            <input
              type="radio"
              value="restricted"
              {...register("campaignType")}
            />
            Restricted
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm">
            <input type="radio" value="open" {...register("campaignType")} />
            Open
          </label>
        </div>
        <p className="mt-1.5 text-xs text-(--text-muted)">
          Restricted = only listed students can pay. Open = anyone with the
          link.
        </p>
      </div>

      {/* Amount type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Amount type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm">
            <input
              type="radio"
              value="fixed"
              {...register("amountType")}
              disabled={campaignType === "restricted"}
            />
            Fixed
          </label>
          <label
            className={`flex items-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm ${
              campaignType === "restricted"
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              value="minimum"
              {...register("amountType")}
              disabled={campaignType === "restricted"}
            />
            Minimum
          </label>
        </div>
        {errors.amountType && (
          <p className="mt-1.5 text-xs text-red-500">
            {errors.amountType.message}
          </p>
        )}
      </div>

      {/* Expiry */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
          Expiry date <span className="text-(--text-muted)">(optional)</span>
        </label>
        <input
          type="datetime-local"
          {...register("expiresAt")}
          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm text-(--text-primary) outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-(--primary) py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}