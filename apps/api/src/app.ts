import "reflect-metadata";

import { randomUUID } from "node:crypto";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySensible from "@fastify/sensible";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { PrismaClient } from "@prisma/client";
import fastify, { type FastifyInstance } from "fastify";
import { redis } from "./infra/cache/redis.js";
import { env } from "./infra/config/env.js";
import { loggerOptions } from "./infra/logger/index.js";
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  register as metricsRegister,
} from "./infra/metrics/index.js";
import { registerCheckoutModule } from "./modules/checkout/index.js";
import { registerIdentityModule } from "./modules/identity/index.js";
import { registerKycModule } from "./modules/kyc/index.js";
import { registerNotificationsModule } from "./modules/notifications/index.js";
import { registerUserdataModule } from "./modules/userdata/index.js";
import { registerWalletModule } from "./modules/wallet/index.js";
import { registerErrorHandler } from "./shared/errors/handler.js";
import type { EventBus } from "./shared/events/EventBus.js";
import { registerHealthRoutes } from "./shared/health/routes.js";
import { registerIdempotencyHooks } from "./shared/middleware/idempotency.js";
import { registerRequestContext } from "./shared/middleware/request-context.js";

export interface AppDeps {
  prisma: PrismaClient;
  events: EventBus;
}

// Factory — no side effects, no `listen()`. server.ts owns the lifecycle.
// Tests can call buildApp() with in-memory deps to get a Fastify instance.
export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
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

  // OpenAPI / Swagger UI — modules contribute schemas via their route opts.
  await app.register(fastifySwagger, {
    openapi: {
      info: { title: "ZADPAY API", version: "0.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      servers: [{ url: "/" }],
    },
  });
  await app.register(fastifySwaggerUi, { routePrefix: "/docs" });

  registerErrorHandler(app);
  registerIdempotencyHooks(app);

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

  // Module routes — ordered by dependency. Identity registers FIRST so its
  // subscribers are attached before KYC publishes any events at boot.
  const identity = await registerIdentityModule(app, deps.prisma, deps.events, {
    jwtSigningKeyPem: env.JWT_SIGNING_KEY,
    jwtVerifyKeyPem: env.JWT_VERIFY_KEY,
    refreshTokenPepper: env.REFRESH_TOKEN_PEPPER,
    accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
  });
  await registerKycModule(app, deps.prisma, deps.events, {
    publicBaseUrl: `http://${env.HOST === "0.0.0.0" ? "localhost" : env.HOST}:${String(env.PORT)}`,
    // 3 s in dev so the demo flows quickly; production swaps for a real
    // KycProvider implementation with no auto-approval.
    inMemoryAutoApproveMs: 3000,
  });
  // Wallet receives identity's phone directory + password verifier — the
  // composition root is the only file that knows both modules exist.
  const { Argon2PasswordHasher } =
    await import("./modules/identity/infrastructure/adapters/Argon2PasswordHasher.js");
  const argon = new Argon2PasswordHasher();
  const wallet = await registerWalletModule(
    app,
    deps.prisma,
    deps.events,
    { defaultCurrency: "USD" },
    {
      recipients: {
        byPhone: (phone) => identity.phoneLookup.byPhone(phone),
      },
      passwords: {
        verify: async (userId, plain) => {
          const row = await deps.prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
          });
          if (row === null) return false;
          return argon.verify(plain, row.passwordHash);
        },
      },
    },
  );
  // Now that wallet's lookup is available, wire identity's recipient-lookup
  // route to it (forms the second half of the cross-module composition).
  await identity.registerLookup({
    primaryAccountForUser: (userId) => wallet.primaryAccountForUser(userId),
  });

  // Notifications subscribes to wallet.TransferPosted and fires FCM push
  // messages. It consumes read-only ports from identity (userId → name)
  // and wallet (accountId → ownerId) — no other coupling.
  await registerNotificationsModule(app, deps.prisma, deps.events, {
    userLookup: identity.userLookup,
    ownerOfAccount: (accountId) => wallet.ownerOfAccount(accountId),
  });

  await registerUserdataModule(app, deps.prisma);

  // Checkout depends on identity (merchant lookup) + wallet (transfer
  // between users). Both ports are abstract — checkout doesn't import
  // either module's internals.
  await registerCheckoutModule(app, deps.prisma, {
    merchants: {
      byPhone: async (phone) => {
        const r = await identity.phoneLookup.byPhone(phone);
        if (r === null) return null;
        return { userId: r.userId, phone: r.phone, fullName: r.fullName ?? null };
      },
    },
    wallet: {
      transfer: (input) => wallet.transferBetweenUsers(input),
    },
  });

  return app;
}
