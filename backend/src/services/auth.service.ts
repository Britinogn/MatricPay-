import { UserStatus } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../utils/email";
import { HttpError } from "../utils/http-error";
import { signAccessToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { verifySupabaseAccessToken } from "../utils/supabase-auth";
import { generateResetToken, hashResetToken } from "../utils/token";
import {
  ForgotPasswordInput,
  GoogleSyncInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

function toSafeUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

function createAuthResponse(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
}) {
  return {
    user: toSafeUser(user),
    token: signAccessToken({ userId: user.id, role: user.role }),
  };
}

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new HttpError(409, "Email is already in use");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: "organizer",
    });

    void sendWelcomeEmail(user.email, user.fullName);

    return createAuthResponse(user);
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user?.passwordHash) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (user.status === UserStatus.suspended) {
      throw new HttpError(403, "Account is suspended");
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new HttpError(401, "Invalid email or password");
    }

    return createAuthResponse(user);
  }

  async googleSync(data: GoogleSyncInput) {
    const verifiedUser = verifySupabaseAccessToken(data.accessToken);
    let user = await userRepository.findBySupabaseId(verifiedUser.supabaseAuthId);

    if (!user) {
      user = await userRepository.findByEmail(verifiedUser.email);

      if (user) {
        user = await userRepository.update(user.id, {
          supabaseAuthId: verifiedUser.supabaseAuthId,
        });
      } else {
        user = await userRepository.create({
          fullName: verifiedUser.fullName,
          email: verifiedUser.email,
          supabaseAuthId: verifiedUser.supabaseAuthId,
          role: "organizer",
        });

        void sendWelcomeEmail(user.email, user.fullName);
      }
    }

    if (user.status === UserStatus.suspended) {
      throw new HttpError(403, "Account is suspended");
    }

    return createAuthResponse(user);
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(data.email);

    if (user?.passwordHash) {
      const resetToken = generateResetToken();
      const tokenHash = hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await userRepository.update(user.id, {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
        passwordResetRequestedAt: new Date(),
      });

      void sendPasswordResetEmail(user.email, resetToken);
    }

    return { message: "If an account with that email exists, a password reset link has been sent." };
  }

  async resetPassword(data: ResetPasswordInput) {
    const tokenHash = hashResetToken(data.token);
    const user = await userRepository.findByResetTokenHash(tokenHash);

    if (!user?.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
      throw new HttpError(400, "Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(data.newPassword);

    await userRepository.update(user.id, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      passwordResetRequestedAt: null,
    });

    return { message: "Password has been successfully reset" };
  }
}

export const authService = new AuthService();
