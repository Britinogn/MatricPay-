"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const zod_1 = require("zod");
class AuthController {
    async register(req, res) {
        try {
            const data = auth_validator_1.RegisterSchema.parse(req.body);
            const result = await auth_service_1.authService.register(data);
            res.status(201).json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
                return;
            }
            res.status(400).json({ error: error.message || "Registration failed" });
        }
    }
    async login(req, res) {
        try {
            const data = auth_validator_1.LoginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(data);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
                return;
            }
            res.status(401).json({ error: error.message || "Login failed" });
        }
    }
    async googleSync(req, res) {
        try {
            const data = auth_validator_1.GoogleSyncSchema.parse(req.body);
            const result = await auth_service_1.authService.googleSync(data);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
                return;
            }
            res.status(400).json({ error: error.message || "Google sync failed" });
        }
    }
    async forgotPassword(req, res) {
        try {
            const data = auth_validator_1.ForgotPasswordSchema.parse(req.body);
            const result = await auth_service_1.authService.forgotPassword(data);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
                return;
            }
            res.status(400).json({ error: error.message || "Failed to process request" });
        }
    }
    async resetPassword(req, res) {
        try {
            const data = auth_validator_1.ResetPasswordSchema.parse(req.body);
            const result = await auth_service_1.authService.resetPassword(data);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
                return;
            }
            res.status(400).json({ error: error.message || "Failed to reset password" });
        }
    }
    async me(req, res) {
        // req.user will be populated by the auth middleware
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        res.status(200).json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map