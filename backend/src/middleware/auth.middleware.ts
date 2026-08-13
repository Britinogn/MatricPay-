import type { NextFunction, Request, Response } from "express";
import { UserStatus } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { verifyAccessToken } from "../utils/jwt";
import { HttpError } from "../utils/http-error";

export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Missing or invalid token");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      throw new HttpError(401, "Unauthorized: Missing or invalid token");
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new HttpError(401, "Unauthorized: User not found");
    }

    if (user.status === UserStatus.suspended) {
      throw new HttpError(403, "Forbidden: Account is suspended");
    }

    request.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Unauthorized: Invalid or expired token"));
  }
}
