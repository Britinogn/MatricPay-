"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.notFoundMiddleware = void 0;
const zod_1 = require("zod");
const env_1 = require("../config/env");
const http_error_1 = require("../utils/http-error");
const notFoundMiddleware = (_error, request, _response, next) => {
    next(new http_error_1.HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};
exports.notFoundMiddleware = notFoundMiddleware;
const errorMiddleware = (error, _request, response, _next) => {
    if (error instanceof zod_1.ZodError) {
        return response.status(400).json({
            success: false,
            message: "Validation failed",
            errors: zod_1.z.flattenError(error),
        });
    }
    if (error instanceof http_error_1.HttpError) {
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
        stack: env_1.isProduction ? undefined : error instanceof Error ? error.stack : undefined,
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map