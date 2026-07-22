import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  ForgotPasswordSchema,
  GoogleSyncSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator";
import { z } from "zod";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }

  async googleSync(req: Request, res: Response): Promise<void> {
    try {
      const data = GoogleSyncSchema.parse(req.body);
      const result = await authService.googleSync(data);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(400).json({ error: error.message || "Google sync failed" });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const data = ForgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(data);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(400).json({ error: error.message || "Failed to process request" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const data = ResetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
        return;
      }
      res.status(400).json({ error: error.message || "Failed to reset password" });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    // req.user will be populated by the auth middleware
    const user = (req as any).user;
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

export const authController = new AuthController();
