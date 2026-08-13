import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("MatricPay"),
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().int().positive().default(5000),
  APP_URL: z.url(),
  CLIENT_URL: z.url(),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  SUPABASE_JWT_SECRET: z.string().min(32, "SUPABASE_JWT_SECRET must be at least 32 characters"),

  PAYSTACK_PUBLIC_KEY: z.string().min(1, "PAYSTACK_PUBLIC_KEY is required"),
  PAYSTACK_SECRET_KEY: z.string().min(1, "PAYSTACK_SECRET_KEY is required"),

  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(2_097_152),
  MAX_UPLOAD_ROWS: z.coerce.number().int().positive().default(5_000),

  EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),

  BCRYPT_ROUNDS: z.coerce.number().int().positive().default(12),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment configuration",
    z.flattenError(parsedEnv.error).fieldErrors
  );

  throw new Error("Invalid environment configuration");
}

export const env = parsedEnv.data;

export const isProduction = env.APP_ENV === "production";
export const isDevelopment = env.APP_ENV === "development";
