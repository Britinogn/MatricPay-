"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSyncSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(4, { message: "Full name must be at least 4 characters" }),
    email: zod_1.z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
    password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters" }),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
    password: zod_1.z.string().min(1, { message: "Password is required" }),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, { message: "Token is required" }),
    newPassword: zod_1.z.string().min(8, { message: "New password must be at least 8 characters" }),
});
exports.GoogleSyncSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1, { message: "Supabase access token is required" }),
});
//# sourceMappingURL=auth.validator.js.map