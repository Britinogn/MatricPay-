"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.post("/register", auth_controller_1.authController.register.bind(auth_controller_1.authController));
exports.authRoutes.post("/login", auth_controller_1.authController.login.bind(auth_controller_1.authController));
exports.authRoutes.post("/google-sync", auth_controller_1.authController.googleSync.bind(auth_controller_1.authController));
exports.authRoutes.post("/forgot-password", auth_controller_1.authController.forgotPassword.bind(auth_controller_1.authController));
exports.authRoutes.post("/reset-password", auth_controller_1.authController.resetPassword.bind(auth_controller_1.authController));
// Protected routes
exports.authRoutes.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.authController.me.bind(auth_controller_1.authController));
//# sourceMappingURL=auth.routes.js.map