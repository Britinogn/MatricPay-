import type { ErrorRequestHandler } from "express";
import { z, ZodError } from "zod";
import { isProduction } from "../config/env";
import { HttpError } from "../utils/http-error";

export const notFoundMiddleware: ErrorRequestHandler = (
    _error,
    request,
    _response,
    next
) => {
    next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorMiddleware: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next
) => {
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
};