import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().trim().min(4, { message: "Full name must be at least 4 characters" }),
  email: z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const LoginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
  password: z.string().min(1, { message: "Password is required" }),
});

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }).transform((email) => email.toLowerCase()),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
});

export const GoogleSyncSchema = z.object({
  accessToken: z.string().min(1, { message: "Supabase access token is required" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type GoogleSyncInput = z.infer<typeof GoogleSyncSchema>;
