"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const email_1 = require("../utils/email");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const token_1 = require("../utils/token");
class AuthService {
    async register(data) {
        const existingUser = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email is already in use");
        }
        const passwordHash = await (0, password_1.hashPassword)(data.password);
        const user = await user_repository_1.userRepository.create({
            fullName: data.fullName,
            email: data.email,
            passwordHash,
            role: "organizer",
        });
        // Send welcome email asynchronously without awaiting to not block the response
        void (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
        const token = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
    async login(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
        }
        if (user.status === client_1.UserStatus.suspended) {
            throw new Error("Account is suspended");
        }
        const isValidPassword = await (0, password_1.comparePassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }
        const token = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
    async googleSync(data) {
        let user = await user_repository_1.userRepository.findBySupabaseId(data.supabaseAuthId);
        if (!user) {
            // Check if user exists by email but without supabaseAuthId
            user = await user_repository_1.userRepository.findByEmail(data.email);
            if (user) {
                // Link the existing account
                user = await user_repository_1.userRepository.update(user.id, {
                    supabaseAuthId: data.supabaseAuthId,
                });
            }
            else {
                // Create new account
                user = await user_repository_1.userRepository.create({
                    fullName: data.fullName,
                    email: data.email,
                    supabaseAuthId: data.supabaseAuthId,
                    role: "organizer",
                });
                void (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
            }
        }
        if (user.status === client_1.UserStatus.suspended) {
            throw new Error("Account is suspended");
        }
        const token = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
    async forgotPassword(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        // We always return success to prevent email enumeration,
        // but we only process if the user exists and doesn't rely solely on Google Auth
        if (user && user.passwordHash) {
            const resetToken = (0, token_1.generateResetToken)();
            const tokenHash = (0, token_1.hashResetToken)(resetToken);
            // Expire in 1 hour
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            await user_repository_1.userRepository.update(user.id, {
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: expiresAt,
                passwordResetRequestedAt: new Date(),
            });
            void (0, email_1.sendPasswordResetEmail)(user.email, resetToken);
        }
        return { message: "If an account with that email exists, a password reset link has been sent." };
    }
    async resetPassword(data) {
        const tokenHash = (0, token_1.hashResetToken)(data.token);
        const user = await user_repository_1.userRepository.findByResetTokenHash(tokenHash);
        if (!user || !user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
            throw new Error("Invalid or expired reset token");
        }
        const passwordHash = await (0, password_1.hashPassword)(data.newPassword);
        await user_repository_1.userRepository.update(user.id, {
            passwordHash,
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
            passwordResetRequestedAt: null,
        });
        return { message: "Password has been successfully reset" };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map