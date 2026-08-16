"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = require("./lib/prisma");
const password_1 = require("./utils/password");
async function seedAdmin() {
    const email = "admin@matricpay.com";
    const password = "AdminPassword123!";
    const passwordHash = await (0, password_1.hashPassword)(password);
    const admin = await prisma_1.prisma.user.upsert({
        where: { email },
        update: {
            role: client_1.UserRole.admin,
            passwordHash,
        },
        create: {
            email,
            fullName: "Super Admin",
            passwordHash,
            role: client_1.UserRole.admin,
        },
    });
    console.log("Admin user created/updated successfully:");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
}
seedAdmin()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=seed_admin.js.map