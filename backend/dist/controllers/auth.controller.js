"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
class AuthController {
    async register(request, response) {
        const data = auth_validator_1.RegisterSchema.parse(request.body);
        const result = await auth_service_1.authService.register(data);
        response.status(201).json(result);
    }
    async login(request, response) {
        const data = auth_validator_1.LoginSchema.parse(request.body);
        const result = await auth_service_1.authService.login(data);
        response.status(200).json(result);
    }
    async googleSync(request, response) {
        const data = auth_validator_1.GoogleSyncSchema.parse(request.body);
        const result = await auth_service_1.authService.googleSync(data);
        response.status(200).json(result);
    }
    async forgotPassword(request, response) {
        const data = auth_validator_1.ForgotPasswordSchema.parse(request.body);
        const result = await auth_service_1.authService.forgotPassword(data);
        response.status(200).json(result);
    }
    async resetPassword(request, response) {
        const data = auth_validator_1.ResetPasswordSchema.parse(request.body);
        const result = await auth_service_1.authService.resetPassword(data);
        response.status(200).json(result);
    }
    async me(request, response) {
        response.status(200).json({
            user: request.user
                ? {
                    id: request.user.id,
                    fullName: request.user.fullName,
                    email: request.user.email,
                    role: request.user.role,
                }
                : null,
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map