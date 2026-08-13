import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { HttpError } from "../utils/http-error";

export function requireRole(allowedRoles: UserRole[]) {
  return function roleMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction
  ): void {
    if (!request.user) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new HttpError(403, "Forbidden: Insufficient permissions"));
      return;
    }

    next();
  };
}

export const requireAnyRole = requireRole;
