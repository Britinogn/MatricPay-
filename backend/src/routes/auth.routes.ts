import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register.bind(authController)));
authRoutes.post("/login", asyncHandler(authController.login.bind(authController)));
authRoutes.post("/google-sync", asyncHandler(authController.googleSync.bind(authController)));
authRoutes.post("/forgot-password", asyncHandler(authController.forgotPassword.bind(authController)));
authRoutes.post("/reset-password", asyncHandler(authController.resetPassword.bind(authController)));

authRoutes.get("/me", authMiddleware, asyncHandler(authController.me.bind(authController)));
