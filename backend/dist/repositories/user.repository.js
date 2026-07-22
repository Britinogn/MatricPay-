"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma");
class UserRepository {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    }
    async findBySupabaseId(supabaseAuthId) {
        return prisma_1.prisma.user.findUnique({ where: { supabaseAuthId } });
    }
    async findByResetTokenHash(passwordResetTokenHash) {
        return prisma_1.prisma.user.findFirst({
            where: {
                passwordResetTokenHash,
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.user.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map