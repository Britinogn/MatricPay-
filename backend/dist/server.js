"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const app_1 = require("./app");
const server = app_1.app.listen(env_1.env.APP_PORT, () => {
    console.log(`${env_1.env.APP_NAME} API running on port ${env_1.env.APP_PORT}`);
});
async function shutdown(signal) {
    console.log(`${signal} received. Shutting down server.`);
    server.close(async () => {
        await prisma_1.prisma.$disconnect();
        process.exit(0);
    });
}
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
//# sourceMappingURL=server.js.map