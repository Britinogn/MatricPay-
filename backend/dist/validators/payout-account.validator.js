"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubaccountSchema = exports.CreateSubaccountSchema = exports.ResolveAccountSchema = void 0;
const zod_1 = require("zod");
exports.ResolveAccountSchema = zod_1.z.object({
    bank_code: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Bank code is required" }),
    account_number: zod_1.z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" }),
});
exports.CreateSubaccountSchema = zod_1.z.object({
    business_name: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Business name must be at least 3 characters" })
        .max(255, { message: "Business name must not exceed 255 characters" }),
    settlement_bank: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Settlement bank code is required" }),
    account_number: zod_1.z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" }),
    percentage_charge: zod_1.z
        .number()
        .optional()
        .default(0)
        .refine((val) => val >= 0 && val <= 100, {
        message: "Percentage charge must be between 0 and 100",
    }),
});
exports.UpdateSubaccountSchema = zod_1.z.object({
    business_name: zod_1.z
        .string()
        .trim()
        .min(3, { message: "Business name must be at least 3 characters" })
        .max(255, { message: "Business name must not exceed 255 characters" })
        .optional(),
    settlement_bank: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Settlement bank code is required" })
        .optional(),
    account_number: zod_1.z
        .string()
        .trim()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" })
        .max(10, { message: "Account number must be exactly 10 digits" })
        .optional(),
});
//# sourceMappingURL=payout-account.validator.js.map