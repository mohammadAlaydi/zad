import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../logger/index.js";

// Single Prisma client per process. Pool sizing is configured via the
// DATABASE_URL `connection_limit` query parameter (ADR-0004).
export const prisma = new PrismaClient({
  log: env.LOG_LEVEL === "debug" ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}

export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.warn({ err }, "Database health check failed");
    return false;
  }
}
