import { NextFunction, Request, Response } from "express";
import { UserStatus } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { verifyAccessToken } from "../utils/jwt";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    if (user.status === UserStatus.suspended) {
      res.status(403).json({ error: "Forbidden: Account is suspended" });
      return;
    }

    // Attach user to the request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
