"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireAnyRole = (allowedRoles) => (0, exports.requireRole)(allowedRoles);
exports.requireAnyRole = requireAnyRole;
//# sourceMappingURL=role.middleware.js.map