"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const jwt_1 = require("../utils/jwt");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await user_repository_1.userRepository.findById(payload.userId);
        if (!user) {
            res.status(401).json({ error: "Unauthorized: User not found" });
            return;
        }
        if (user.status === client_1.UserStatus.suspended) {
            res.status(403).json({ error: "Forbidden: Account is suspended" });
            return;
        }
        // Attach user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map