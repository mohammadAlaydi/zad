import "reflect-metadata";

import { randomUUID } from "node:crypto";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySensible from "@fastify/sensible";
import fastify, { type FastifyInstance } from "fastify";
import { redis } from "./infra/cache/redis.js";
import { env } from "./infra/config/env.js";
import { loggerOptions } from "./infra/logger/index.js";
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  register as metricsRegister,
} from "./infra/metrics/index.js";
import { registerErrorHandler } from "./shared/errors/handler.js";
import { registerHealthRoutes } from "./shared/health/routes.js";
import { registerRequestContext } from "./shared/middleware/request-context.js";

// Factory — no side effects, no `listen()`. server.ts owns the lifecycle.
// Tests can call buildApp() to get an in-memory Fastify instance.
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: loggerOptions,
    // Honor X-Request-Id from the client (e.g. mobile app) or generate UUID v4.
    genReqId: (req) => {
      const incoming = req.headers["x-request-id"];
      return typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
    },
    requestIdHeader: "x-request-id",
    trustProxy: true,
    disableRequestLogging: false,
  });

  // Plugins must register before routes so hooks fire in the right order.
  await registerRequestContext(app);
  await app.register(fastifySensible);
  await app.register(fastifyHelmet, {
    // We don't serve HTML — CSP is the mobile client's problem, not ours.
    contentSecurityPolicy: false,
  });
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    credentials: true,
  });
  await app.register(fastifyRateLimit, {
    redis,
    max: 100,
    timeWindow: "1 minute",
    nameSpace: "rl:",
    // Per-user limits land with auth in PR-4.
    keyGenerator: (req) => req.ip,
  });

  registerErrorHandler(app);

  // Per-request metrics. Cardinality is bounded because `route` is the
  // matched route pattern, not the literal URL.
  app.addHook("onResponse", (req, reply, done) => {
    const route = req.routeOptions.url ?? "unmatched";
    const labels = { method: req.method, route, status: String(reply.statusCode) };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, reply.elapsedTime / 1000);
    done();
  });

  app.get("/metrics", { logLevel: "warn" }, async (req, reply) => {
    const allowlist = env.METRICS_ALLOWLIST.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!allowlist.includes(req.ip)) {
      await reply.status(403).send({
        code: "COMMON.FORBIDDEN",
        message: "Metrics endpoint not allowed from this address",
        requestId: req.id,
      });
      return;
    }
    void reply.header("Content-Type", metricsRegister.contentType);
    await reply.send(await metricsRegister.metrics());
  });

  await registerHealthRoutes(app);

  // Module routes register here as they land — PR-4 (identity), PR-6 (kyc),
  // PR-9 (wallet). Each module exposes a `register(app)` function from its
  // barrel; this file calls them in dependency order.

  return app;
}
