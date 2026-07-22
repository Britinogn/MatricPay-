import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const authRoutes = Router();

authRoutes.post("/register", authController.register.bind(authController));
authRoutes.post("/login", authController.login.bind(authController));
authRoutes.post("/google-sync", authController.googleSync.bind(authController));
authRoutes.post("/forgot-password", authController.forgotPassword.bind(authController));
authRoutes.post("/reset-password", authController.resetPassword.bind(authController));

// Protected routes
authRoutes.get("/me", authMiddleware, authController.me.bind(authController));
