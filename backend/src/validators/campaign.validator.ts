import { z } from "zod";

const uuidSchema = z.uuid({ message: "Invalid ID format" });
const currencySchema = z
  .string()
  .trim()
  .length(3, { message: "Currency must be a 3-letter ISO code" })
  .transform((currency) => currency.toUpperCase());

const optionalTextSchema = z
  .string()
  .trim()
  .max(1_000, { message: "Description must not exceed 1000 characters" })
  .optional()
  .nullable();

const expiresAtSchema = z
  .string()
  .datetime({ offset: true, message: "expiresAt must be a valid ISO datetime" })
  .optional()
  .nullable();

export const CreateCampaignSchema = z.object({
  organizationId: uuidSchema.optional().nullable(),
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(120, { message: "Title must not exceed 120 characters" }),
  description: optionalTextSchema,
  // amount: z.coerce
  //   .number()
  //   .positive({ message: "Amount must be greater than zero" })
  //   .max(100_000_000, { message: "Amount is too large" }),
  netAmount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" })
    .max(100_000_000, { message: "Amount is too large" }),
  amountType: z.enum(["fixed", "minimum"]).default("fixed"),
  currency: currencySchema.default("NGN"),
  campaignType: z.enum(["restricted", "open"]).default("restricted"),
  expiresAt: expiresAtSchema,
});

export const UpdateCampaignSchema = z
  .object({
    organizationId: uuidSchema.optional().nullable(),
    title: z
      .string()
      .trim()
      .min(3, { message: "Title must be at least 3 characters" })
      .max(120, { message: "Title must not exceed 120 characters" })
      .optional(),
    description: optionalTextSchema,
    // amount: z.coerce
    //   .number()
    //   .positive({ message: "Amount must be greater than zero" })
    //   .max(100_000_000, { message: "Amount is too large" })
    //   .optional(),
    netAmount: z.coerce
      .number()
      .positive()
      .max(100_000_000)
      .optional(),
    amountType: z.enum(["fixed", "minimum"]).optional(),
    currency: currencySchema.optional(),
    campaignType: z.enum(["restricted", "open"]).optional(),
    expiresAt: expiresAtSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one campaign field is required",
  });

export const CampaignIdParamSchema = z.object({
  id: uuidSchema,
});

export const CampaignSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format" }),
});

export const UpdateCampaignStatusSchema = z.object({
  status: z.enum(["active", "closed"]),
});

export const CampaignListQuerySchema = z.object({
  status: z.enum(["draft", "active", "closed"]).optional(),
  campaignType: z.enum(["restricted", "open"]).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export const BulkDeleteCampaignsSchema = z.object({
  campaignIds: z
    .array(uuidSchema)
    .min(1, { message: "At least one campaign ID is required" }),
});


export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type CampaignIdParamInput = z.infer<typeof CampaignIdParamSchema>;
export type CampaignSlugParamInput = z.infer<typeof CampaignSlugParamSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof UpdateCampaignStatusSchema>;
export type CampaignListQueryInput = z.infer<typeof CampaignListQuerySchema>;
export type BulkDeleteCampaignsInput = z.infer<typeof BulkDeleteCampaignsSchema>;
