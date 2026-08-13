import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { isProduction } from "../config/env";
import { HttpError } from "../utils/http-error";

export function notFoundMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.flattenError(error),
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: "Internal server error",
    stack: isProduction ? undefined : error instanceof Error ? error.stack : undefined,
  });
}
