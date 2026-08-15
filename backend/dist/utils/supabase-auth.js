"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySupabaseAccessToken = verifySupabaseAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const http_error_1 = require("./http-error");
function verifySupabaseAccessToken(token) {
    const payload = jsonwebtoken_1.default.verify(token, env_1.env.SUPABASE_JWT_SECRET);
    if (!payload.sub || !payload.email) {
        throw new http_error_1.HttpError(401, "Invalid Supabase token");
    }
    return {
        supabaseAuthId: payload.sub,
        email: payload.email.toLowerCase(),
        fullName: payload.user_metadata?.full_name?.trim() ||
            payload.user_metadata?.name?.trim() ||
            payload.email.split("@")[0],
    };
}
//# sourceMappingURL=supabase-auth.js.map