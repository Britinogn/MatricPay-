import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  ForgotPasswordSchema,
  GoogleSyncSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator";

export class AuthController {
  async register(request: Request, response: Response): Promise<void> {
    const data = RegisterSchema.parse(request.body);
    const result = await authService.register(data);
    response.status(201).json(result);
  }

  async login(request: Request, response: Response): Promise<void> {
    const data = LoginSchema.parse(request.body);
    const result = await authService.login(data);
    response.status(200).json(result);
  }

  async googleSync(request: Request, response: Response): Promise<void> {
    const data = GoogleSyncSchema.parse(request.body);
    const result = await authService.googleSync(data);
    response.status(200).json(result);
  }

  async forgotPassword(request: Request, response: Response): Promise<void> {
    const data = ForgotPasswordSchema.parse(request.body);
    const result = await authService.forgotPassword(data);
    response.status(200).json(result);
  }

  async resetPassword(request: Request, response: Response): Promise<void> {
    const data = ResetPasswordSchema.parse(request.body);
    const result = await authService.resetPassword(data);
    response.status(200).json(result);
  }

  async me(request: Request, response: Response): Promise<void> {
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

export const authController = new AuthController();
