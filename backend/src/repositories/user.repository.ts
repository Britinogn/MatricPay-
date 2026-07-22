import { Prisma, User } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findBySupabaseId(supabaseAuthId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { supabaseAuthId } });
  }

  async findByResetTokenHash(passwordResetTokenHash: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        passwordResetTokenHash,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
