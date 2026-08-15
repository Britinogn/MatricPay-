"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = exports.isProduction = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    APP_NAME: zod_1.z.string().default("MatricPay"),
    APP_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    APP_PORT: zod_1.z.coerce.number().int().positive().default(5000),
    APP_URL: zod_1.z.url(),
    CLIENT_URL: zod_1.z.url(),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: zod_1.z.string().default("1h"),
    SUPABASE_JWT_SECRET: zod_1.z.string().min(32, "SUPABASE_JWT_SECRET must be at least 32 characters"),
    PAYSTACK_PUBLIC_KEY: zod_1.z.string().min(1, "PAYSTACK_PUBLIC_KEY is required"),
    PAYSTACK_SECRET_KEY: zod_1.z.string().min(1, "PAYSTACK_SECRET_KEY is required"),
    MAX_UPLOAD_SIZE: zod_1.z.coerce.number().int().positive().default(2_097_152),
    MAX_UPLOAD_ROWS: zod_1.z.coerce.number().int().positive().default(5_000),
    EMAIL_HOST: zod_1.z.string().min(1, "EMAIL_HOST is required"),
    EMAIL_PORT: zod_1.z.coerce.number().int().positive().default(587),
    EMAIL_SECURE: zod_1.z.coerce.boolean().default(false),
    EMAIL_USER: zod_1.z.string().min(1, "EMAIL_USER is required"),
    EMAIL_PASS: zod_1.z.string().min(1, "EMAIL_PASS is required"),
    EMAIL_FROM: zod_1.z.string().min(1, "EMAIL_FROM is required"),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().int().positive().default(12),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid environment configuration", zod_1.z.flattenError(parsedEnv.error).fieldErrors);
    throw new Error("Invalid environment configuration");
}
exports.env = parsedEnv.data;
exports.isProduction = exports.env.APP_ENV === "production";
exports.isDevelopment = exports.env.APP_ENV === "development";
//# sourceMappingURL=env.js.map