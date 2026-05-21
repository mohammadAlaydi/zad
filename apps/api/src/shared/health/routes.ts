import type { FastifyInstance } from "fastify";
import { isRedisHealthy } from "../../infra/cache/redis.js";
import { isDatabaseHealthy } from "../../infra/database/prisma.js";

// k8s-style health endpoints per ADR-0009:
//   /health/live    — process alive; does NOT touch DB/Redis
//   /health/ready   — process can serve traffic (DB + Redis up)
//   /health/startup — returns 200 only after the first successful /ready,
//                     used for slow-start grace periods
let startupCompleted = false;

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/test", { logLevel: "warn" }, async (_req, reply) => {
    await reply.send({ status: "test success" });
  });

  app.get("/health/live", { logLevel: "warn" }, async (_req, reply) => {
    await reply.send({ status: "ok" });
  });

  app.get("/health/ready", { logLevel: "warn" }, async (_req, reply) => {
    const [db, redisOk] = await Promise.all([isDatabaseHealthy(), isRedisHealthy()]);
    if (db && redisOk) {
      startupCompleted = true;
      await reply.send({ status: "ok", checks: { db, redis: redisOk } });
      return;
    }
    await reply.status(503).send({ status: "degraded", checks: { db, redis: redisOk } });
  });

  app.get("/health/startup", { logLevel: "warn" }, async (_req, reply) => {
    if (startupCompleted) {
      await reply.send({ status: "ok" });
      return;
    }
    await reply.status(503).send({ status: "starting" });
  });
}
