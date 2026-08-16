import { z } from "zod";

export const ResolveAccountSchema = z.object({
    bank_code: z
        .string()
        .trim()
        .min(1, { message: "Bank code is required" }),
    account_number: z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" }),
});

export const CreateSubaccountSchema = z.object({
    business_name: z
        .string()
        .trim()
        .min(3, { message: "Business name must be at least 3 characters" })
        .max(255, { message: "Business name must not exceed 255 characters" }),
    settlement_bank: z
        .string()
        .trim()
        .min(1, { message: "Settlement bank code is required" }),
    account_number: z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" }),
    percentage_charge: z
        .number()
        .optional()
        .default(0)
        .refine((val) => val >= 0 && val <= 100, {
        message: "Percentage charge must be between 0 and 100",
        }),
});

export const UpdateSubaccountSchema = z.object({
    business_name: z
        .string()
        .trim()
        .min(3, { message: "Business name must be at least 3 characters" })
        .max(255, { message: "Business name must not exceed 255 characters" })
        .optional(),
    settlement_bank: z
        .string()
        .trim()
        .min(1, { message: "Settlement bank code is required" })
        .optional(),
    account_number: z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" })
        .optional(),
});

export type ResolveAccountInput = z.infer<typeof ResolveAccountSchema>;
export type CreateSubaccountInput = z.infer<typeof CreateSubaccountSchema>;
export type UpdateSubaccountInput = z.infer<typeof UpdateSubaccountSchema>;
