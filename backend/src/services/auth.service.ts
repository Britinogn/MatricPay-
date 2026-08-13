import { UserStatus } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../utils/email";
import { signAccessToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { generateResetToken, hashResetToken } from "../utils/token";
import {
  ForgotPasswordInput,
  GoogleSyncInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: "organizer",
    });

    // Send welcome email asynchronously without awaiting to not block the response
    void sendWelcomeEmail(user.email, user.fullName);

    const token = signAccessToken({ userId: user.id, role: user.role });

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

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    if (user.status === UserStatus.suspended) {
      throw new Error("Account is suspended");
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const token = signAccessToken({ userId: user.id, role: user.role });

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

  async googleSync(data: GoogleSyncInput) {
    let user = await userRepository.findBySupabaseId(data.supabaseAuthId);

    if (!user) {
      // Check if user exists by email but without supabaseAuthId
      user = await userRepository.findByEmail(data.email);
      
      if (user) {
        // Link the existing account
        user = await userRepository.update(user.id, {
          supabaseAuthId: data.supabaseAuthId,
        });
      } else {
        // Create new account
        user = await userRepository.create({
          fullName: data.fullName,
          email: data.email,
          supabaseAuthId: data.supabaseAuthId,
          role: "organizer",
        });

        void sendWelcomeEmail(user.email, user.fullName);
      }
    }

    if (user.status === UserStatus.suspended) {
      throw new Error("Account is suspended");
    }

    const token = signAccessToken({ userId: user.id, role: user.role });

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

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(data.email);
    
    // We always return success to prevent email enumeration,
    // but we only process if the user exists and doesn't rely solely on Google Auth
    if (user && user.passwordHash) {
      const resetToken = generateResetToken();
      const tokenHash = hashResetToken(resetToken);
      
      // Expire in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

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

    if (!user || !user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
      throw new Error("Invalid or expired reset token");
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