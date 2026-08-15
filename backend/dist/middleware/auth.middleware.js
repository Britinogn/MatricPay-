"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const jwt_1 = require("../utils/jwt");
const http_error_1 = require("../utils/http-error");
async function authMiddleware(request, _response, next) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new http_error_1.HttpError(401, "Unauthorized: Missing or invalid token");
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (!token) {
            throw new http_error_1.HttpError(401, "Unauthorized: Missing or invalid token");
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await user_repository_1.userRepository.findById(payload.userId);
        if (!user) {
            throw new http_error_1.HttpError(401, "Unauthorized: User not found");
        }
        if (user.status === client_1.UserStatus.suspended) {
            throw new http_error_1.HttpError(403, "Forbidden: Account is suspended");
        }
        request.user = user;
        next();
    }
    catch (error) {
        next(error instanceof http_error_1.HttpError ? error : new http_error_1.HttpError(401, "Unauthorized: Invalid or expired token"));
    }
}
//# sourceMappingURL=auth.middleware.js.map