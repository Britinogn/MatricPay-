"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = void 0;
exports.requireRole = requireRole;
const http_error_1 = require("../utils/http-error");
function requireRole(allowedRoles) {
    return function roleMiddleware(request, _response, next) {
        if (!request.user) {
            next(new http_error_1.HttpError(401, "Unauthorized"));
            return;
        }
        if (!allowedRoles.includes(request.user.role)) {
            next(new http_error_1.HttpError(403, "Forbidden: Insufficient permissions"));
            return;
        }
        next();
    };
}
exports.requireAnyRole = requireRole;
//# sourceMappingURL=role.middleware.js.map