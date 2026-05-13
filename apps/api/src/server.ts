// Sentry first per @sentry/node v8 guidance.
import "./instrument.js";

import { buildApp } from "./app.js";
import { connectRedis, disconnectRedis } from "./infra/cache/redis.js";
import { env } from "./infra/config/env.js";
import { connectDatabase, disconnectDatabase } from "./infra/database/prisma.js";
import { logger } from "./infra/logger/index.js";
import { shutdownQueues } from "./infra/queue/index.js";

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await connectRedis();

    const app = await buildApp();
    await app.listen({ host: env.HOST, port: env.PORT });
    logger.info({ host: env.HOST, port: env.PORT, env: env.NODE_ENV }, "API listening");

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      logger.info({ signal }, "Shutting down");
      try {
        // Order: drain HTTP → workers → cache → DB. Reverse of startup.
        await app.close();
        await shutdownQueues();
        await disconnectRedis();
        await disconnectDatabase();
        logger.info("Shutdown complete");
        process.exit(0);
      } catch (err) {
        logger.error({ err }, "Shutdown failed");
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
    process.on("unhandledRejection", (reason) => {
      logger.fatal({ reason }, "Unhandled rejection — crashing");
      process.exit(1);
    });
    process.on("uncaughtException", (err) => {
      logger.fatal({ err }, "Uncaught exception — crashing");
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start");
    process.exit(1);
  }
}

void start();
