"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const async_handler_1 = require("../utils/async-handler");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.post("/register", (0, async_handler_1.asyncHandler)(auth_controller_1.authController.register.bind(auth_controller_1.authController)));
exports.authRoutes.post("/login", (0, async_handler_1.asyncHandler)(auth_controller_1.authController.login.bind(auth_controller_1.authController)));
exports.authRoutes.post("/google-sync", (0, async_handler_1.asyncHandler)(auth_controller_1.authController.googleSync.bind(auth_controller_1.authController)));
exports.authRoutes.post("/forgot-password", (0, async_handler_1.asyncHandler)(auth_controller_1.authController.forgotPassword.bind(auth_controller_1.authController)));
exports.authRoutes.post("/reset-password", (0, async_handler_1.asyncHandler)(auth_controller_1.authController.resetPassword.bind(auth_controller_1.authController)));
exports.authRoutes.get("/me", auth_middleware_1.authMiddleware, (0, async_handler_1.asyncHandler)(auth_controller_1.authController.me.bind(auth_controller_1.authController)));
//# sourceMappingURL=auth.routes.js.map