import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../logger/index.js";

// Single Redis client for cache + rate-limit. BullMQ uses its own connection
// (see infra/queue) because BullMQ needs `maxRetriesPerRequest: null`.
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info("Redis connected");
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info("Redis disconnected");
}

export async function isRedisHealthy(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch (err) {
    logger.warn({ err }, "Redis health check failed");
    return false;
  }
}
