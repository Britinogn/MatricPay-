"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const email_1 = require("../utils/email");
const http_error_1 = require("../utils/http-error");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const supabase_auth_1 = require("../utils/supabase-auth");
const token_1 = require("../utils/token");
function toSafeUser(user) {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
}
function createAuthResponse(user) {
    return {
        user: toSafeUser(user),
        token: (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role }),
    };
}
class AuthService {
    async register(data) {
        const existingUser = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new http_error_1.HttpError(409, "Email is already in use");
        }
        const passwordHash = await (0, password_1.hashPassword)(data.password);
        const user = await user_repository_1.userRepository.create({
            fullName: data.fullName,
            email: data.email,
            passwordHash,
            role: "organizer",
        });
        void (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
        return createAuthResponse(user);
    }
    async login(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (!user?.passwordHash) {
            throw new http_error_1.HttpError(401, "Invalid email or password");
        }
        if (user.status === client_1.UserStatus.suspended) {
            throw new http_error_1.HttpError(403, "Account is suspended");
        }
        const isValidPassword = await (0, password_1.comparePassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new http_error_1.HttpError(401, "Invalid email or password");
        }
        return createAuthResponse(user);
    }
    async googleSync(data) {
        const verifiedUser = (0, supabase_auth_1.verifySupabaseAccessToken)(data.accessToken);
        let user = await user_repository_1.userRepository.findBySupabaseId(verifiedUser.supabaseAuthId);
        if (!user) {
            user = await user_repository_1.userRepository.findByEmail(verifiedUser.email);
            if (user) {
                user = await user_repository_1.userRepository.update(user.id, {
                    supabaseAuthId: verifiedUser.supabaseAuthId,
                });
            }
            else {
                user = await user_repository_1.userRepository.create({
                    fullName: verifiedUser.fullName,
                    email: verifiedUser.email,
                    supabaseAuthId: verifiedUser.supabaseAuthId,
                    role: "organizer",
                });
                void (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
            }
        }
        if (user.status === client_1.UserStatus.suspended) {
            throw new http_error_1.HttpError(403, "Account is suspended");
        }
        return createAuthResponse(user);
    }
    async forgotPassword(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (user?.passwordHash) {
            const resetToken = (0, token_1.generateResetToken)();
            const tokenHash = (0, token_1.hashResetToken)(resetToken);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
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
        if (!user?.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
            throw new http_error_1.HttpError(400, "Invalid or expired reset token");
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