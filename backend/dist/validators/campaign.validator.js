"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkDeleteCampaignsSchema = exports.CampaignListQuerySchema = exports.UpdateCampaignStatusSchema = exports.CampaignSlugParamSchema = exports.CampaignIdParamSchema = exports.UpdateCampaignSchema = exports.CreateCampaignSchema = void 0;
const zod_1 = require("zod");
const uuidSchema = zod_1.z.uuid({ message: "Invalid ID format" });
const currencySchema = zod_1.z
    .string()
    .trim()
    .length(3, { message: "Currency must be a 3-letter ISO code" })
    .transform((currency) => currency.toUpperCase());
const optionalTextSchema = zod_1.z
    .string()
    .trim()
    .max(1_000, { message: "Description must not exceed 1000 characters" })
    .optional()
    .nullable();
const expiresAtSchema = zod_1.z
    .string()
    .datetime({ offset: true, message: "expiresAt must be a valid ISO datetime" })
    .optional()
    .nullable();
exports.CreateCampaignSchema = zod_1.z.object({
    organizationId: uuidSchema.optional().nullable(),
    title: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(120, { message: "Title must not exceed 120 characters" }),
    description: optionalTextSchema,
    amount: zod_1.z.coerce
        .number()
        .positive({ message: "Amount must be greater than zero" })
        .max(100_000_000, { message: "Amount is too large" }),
    amountType: zod_1.z.enum(["fixed", "minimum"]).default("fixed"),
    currency: currencySchema.default("NGN"),
    campaignType: zod_1.z.enum(["restricted", "open"]).default("restricted"),
    expiresAt: expiresAtSchema,
});
exports.UpdateCampaignSchema = zod_1.z
    .object({
    organizationId: uuidSchema.optional().nullable(),
    title: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(120, { message: "Title must not exceed 120 characters" })
        .optional(),
    description: optionalTextSchema,
    amount: zod_1.z.coerce
        .number()
        .positive({ message: "Amount must be greater than zero" })
        .max(100_000_000, { message: "Amount is too large" })
        .optional(),
    amountType: zod_1.z.enum(["fixed", "minimum"]).optional(),
    currency: currencySchema.optional(),
    campaignType: zod_1.z.enum(["restricted", "open"]).optional(),
    expiresAt: expiresAtSchema,
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one campaign field is required",
});
exports.CampaignIdParamSchema = zod_1.z.object({
    id: uuidSchema,
});
exports.CampaignSlugParamSchema = zod_1.z.object({
    slug: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Slug is required" })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format" }),
});
exports.UpdateCampaignStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["active", "closed"]),
});
exports.CampaignListQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["draft", "active", "closed"]).optional(),
    campaignType: zod_1.z.enum(["restricted", "open"]).optional(),
    search: zod_1.z.string().trim().min(1).max(120).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(25),
});
exports.BulkDeleteCampaignsSchema = zod_1.z.object({
    campaignIds: zod_1.z
        .array(uuidSchema)
        .min(1, { message: "At least one campaign ID is required" }),
});
//# sourceMappingURL=campaign.validator.js.map