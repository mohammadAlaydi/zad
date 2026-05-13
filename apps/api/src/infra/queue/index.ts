import type { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../logger/index.js";

// BullMQ requires `maxRetriesPerRequest: null` on its Redis connection,
// which is incompatible with the cache client. Use a dedicated connection.
export const queueConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Module queues are registered here as they land in PR-5+.
// Example: identity.refreshTokenCleanup, wallet.outboxDispatcher.
export const queues: Record<string, Queue> = {};

export async function shutdownQueues(): Promise<void> {
  await Promise.all(Object.values(queues).map((q) => q.close()));
  await queueConnection.quit();
  logger.info("Queues closed");
}
