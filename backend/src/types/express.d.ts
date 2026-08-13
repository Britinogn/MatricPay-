import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      user?: User;
    }
  }
}

export {};
