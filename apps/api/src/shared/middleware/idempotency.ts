// Idempotency middleware per ADR-0007. Redis is the fast path; the DB
// `shared.idempotency_keys` row + (where applicable) the per-aggregate
// unique key in the module schema (e.g. wallet.transactions.idempotency_
// key) is the durable truth.
//
// Flow:
//   1. Read Idempotency-Key header (UUID v4). 400 if missing or malformed.
//   2. sha256(method + path + userId + body) — the request fingerprint.
//   3. Redis SET NX with TTL. If key existed, compare hashes:
//        - same hash + status=done   → replay cached response
//        - same hash + status=failed → replay cached error
//        - different hash            → 422 IDEMPOTENCY_KEY_CONFLICT
//   4. Else proceed; capture the response in onSend and write it back to
//      Redis under the key.

import { createHash, randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../../infra/cache/redis.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TTL_SECONDS = 24 * 60 * 60;

interface CachedResponse {
  hash: string;
  status: "in_progress" | "done" | "failed";
  statusCode?: number;
  body?: unknown;
}

function hashRequest(method: string, path: string, userId: string, body: unknown): string {
  const bodyJson = body === undefined ? "" : JSON.stringify(body);
  return createHash("sha256").update(`${method}|${path}|${userId}|${bodyJson}`).digest("hex");
}

function redisKey(idempotencyKey: string): string {
  return `idem:${idempotencyKey}`;
}

// A Fastify preHandler that enforces idempotency. Attach to mutating
// routes:
//   app.post('/v1/wallet/transfers', { preHandler: [requireAuth, idempotency] }, handler)
export async function idempotency(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers["idempotency-key"];
  if (typeof header !== "string" || !UUID_RE.test(header)) {
    await reply.status(400).send({
      code: "COMMON.VALIDATION",
      message: "Idempotency-Key header must be a UUID v4",
      requestId: req.id,
    });
    return;
  }

  const userId = req.requestContext.get("userId") ?? "anonymous";
  const fingerprint = hashRequest(req.method, req.url, userId, req.body);
  const key = redisKey(header);

  // Try to claim the key.
  const claimed = await redis.set(
    key,
    JSON.stringify({ hash: fingerprint, status: "in_progress" } satisfies CachedResponse),
    "EX",
    TTL_SECONDS,
    "NX",
  );

  if (claimed === null) {
    // Already exists — replay or reject.
    const raw = await redis.get(key);
    if (raw === null) {
      // Race: TTL expired between SET NX and GET. Retry once.
      const second = await redis.set(
        key,
        JSON.stringify({ hash: fingerprint, status: "in_progress" } satisfies CachedResponse),
        "EX",
        TTL_SECONDS,
        "NX",
      );
      if (second === null) {
        await reply.status(409).send({
          code: "COMMON.CONFLICT",
          message: "Idempotency-Key race; please retry",
          requestId: req.id,
        });
        return;
      }
      // Fall through — we now hold the key.
    } else {
      const cached = JSON.parse(raw) as CachedResponse;
      if (cached.hash !== fingerprint) {
        await reply.status(422).send({
          code: "COMMON.IDEMPOTENCY_KEY_CONFLICT",
          message: "Idempotency-Key reused with a different request body",
          requestId: req.id,
        });
        return;
      }
      if (cached.status === "in_progress") {
        await reply.status(409).send({
          code: "COMMON.CONFLICT",
          message: "Request with this Idempotency-Key is already in flight",
          requestId: req.id,
        });
        return;
      }
      // Done or failed — replay.
      await reply.status(cached.statusCode ?? 200).send(cached.body);
      return;
    }
  }

  // We hold the key. Capture the response on send.
  req.idempotencyKey = header;
  req.idempotencyFingerprint = fingerprint;
}

// Hook installed once by registerIdempotencyHooks below — caches the
// final response under the idempotency key. Must be async (or take a
// `done` callback) — a plain sync function with the wrong signature
// silently hangs every response.
async function onSendHook(
  req: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
): Promise<unknown> {
  const key = req.idempotencyKey;
  if (key === undefined || req.idempotencyFingerprint === undefined) return payload;
  const cached: CachedResponse = {
    hash: req.idempotencyFingerprint,
    status: reply.statusCode >= 200 && reply.statusCode < 300 ? "done" : "failed",
    statusCode: reply.statusCode,
    // payload may already be a string (Fastify's serializer ran). Store as is.
    body: typeof payload === "string" ? safeParseJson(payload) : payload,
  };
  void redis.set(redisKey(key), JSON.stringify(cached), "EX", TTL_SECONDS);
  return payload;
}

function safeParseJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    idempotencyKey?: string;
    idempotencyFingerprint?: string;
  }
}

// Call once during app composition so the onSend hook is global.
export function registerIdempotencyHooks(app: FastifyInstance): void {
  app.addHook("onSend", onSendHook);
}

// Helper for callers that want to mint a key client-side in tests.
export function newIdempotencyKey(): string {
  return randomUUID();
}
