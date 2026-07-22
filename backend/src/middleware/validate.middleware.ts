import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/http-error";

type ValidationSchemas = {
    body?: z.ZodType;
    params?: z.ZodType;
    query?: z.ZodType;
};

export function validate(schemas: ValidationSchemas) {
    return function validationMiddleware(
        request: Request,
        _response: Response,
        next: NextFunction
    ) {
        const errors: Record<string, unknown> = {};

        if (schemas.body) {
        const result = schemas.body.safeParse(request.body);
        if (!result.success) {
            errors.body = z.flattenError(result.error);
        } else {
            request.body = result.data;
        }
        }

        if (schemas.params) {
        const result = schemas.params.safeParse(request.params);
        if (!result.success) {
            errors.params = z.flattenError(result.error);
        } else {
            request.params = result.data as typeof request.params;
        }
        }

        if (schemas.query) {
        const result = schemas.query.safeParse(request.query);
        if (!result.success) {
            errors.query = z.flattenError(result.error);
        } else {
            request.query = result.data as typeof request.query;
        }
        }

        if (Object.keys(errors).length > 0) {
        return next(new HttpError(400, "Validation failed", errors));
        }

        return next();
    };
}