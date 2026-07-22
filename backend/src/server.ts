import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { app } from "./app";

const server = app.listen(env.APP_PORT, () => {
    console.log(`${env.APP_NAME} API running on port ${env.APP_PORT}`);
});

async function shutdown(signal: string) {
    console.log(`${signal} received. Shutting down server.`);

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});