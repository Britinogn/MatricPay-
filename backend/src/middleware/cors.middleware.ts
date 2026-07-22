import cors from "cors";
import { env } from "../config/env";

export const corsMiddleware = cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Paystack-Signature"],
});
