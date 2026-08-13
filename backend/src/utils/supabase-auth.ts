import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./http-error";

type SupabaseAccessTokenPayload = jwt.JwtPayload & {
  sub?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

export type VerifiedSupabaseUser = {
  supabaseAuthId: string;
  email: string;
  fullName: string;
};

export function verifySupabaseAccessToken(token: string): VerifiedSupabaseUser {
  const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseAccessTokenPayload;

  if (!payload.sub || !payload.email) {
    throw new HttpError(401, "Invalid Supabase token");
  }

  return {
    supabaseAuthId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName:
      payload.user_metadata?.full_name?.trim() ||
      payload.user_metadata?.name?.trim() ||
      payload.email.split("@")[0],
  };
}
