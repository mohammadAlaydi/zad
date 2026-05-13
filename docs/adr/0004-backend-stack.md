# ADR-0004: Backend stack — Fastify + Prisma + Postgres + Redis + BullMQ + Pino + Zod

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** backend

## Context

No backend exists in the repo today. The brief specifies "Node.js modular monolith, ready to extract to microservices, built for 120M users." Scope (per Q&A) is a **vertical slice**: auth + KYC + money movement, plus a stubbed event bus and the cross-cutting platform concerns.

Audit reference: [audit §1, §3, §6](../audit.md).

## Decision

```
Runtime:        Node.js 20 LTS
Language:       TypeScript 5.4, strict, no `any`
HTTP framework: Fastify 4
ORM:            Prisma 5 (driver-adapter mode w/ Postgres)
Database:       Postgres 16
Cache:          Redis 7 (ioredis client)
Queue:          BullMQ 5 (Redis-backed)
Validation:     Zod 3 (shared schemas via @zadpay/validation)
Auth:           jose for JWT; bcrypt for password (argon2id alternative — see below)
Logger:         Pino 9 + pino-pretty (dev only)
Metrics:        prom-client
Tracing:        @opentelemetry/api (instrumentation ready, exporter not enabled in P1)
Testing:        Vitest 1.x (unit), Supertest (HTTP), Testcontainers (Postgres + Redis)
Container:      Docker (multi-stage, distroless final)
DI:             tsyringe (lightweight reflection-based container)
Result type:    @zadpay/errors (custom; not neverthrow — see below)
```

### Why Fastify (not Express, Nest, Hono)

- **Throughput:** Fastify benchmarks at ~3× Express on simple routes with schema validation; the difference comes from `find-my-way` routing + JSON-schema-compiled serialization (we hand it Zod-derived JSON schemas).
- **TypeScript-native:** Generics for `FastifyRequest<{ Body: T }>` propagate without boilerplate.
- **Plugin model:** every cross-cutting concern (auth, rate limit, helmet, request-context, multipart, swagger) is a first-party plugin with stable contracts.
- **Schema-first:** Fastify expects a JSON Schema per route; we generate it from Zod with `zod-to-json-schema`. Validation, OpenAPI doc, and TypeScript types come from one source.
- Rejected **Express**: lower perf, weaker types, no first-party schema support.
- Rejected **NestJS**: it's a framework-over-the-framework; its module/DI system fights our hexagonal layout (Nest's DI assumes Nest controllers, services, providers — we want plain TS classes); decorator-heavy code is harder to extract to a microservice without dragging Nest along. The "modular monolith → microservice" extraction is exactly the case where Nest's ceremony hurts.
- Rejected **Hono**: excellent on the edge / Cloudflare Workers, but the plugin ecosystem and OpenAPI integration around Fastify are more mature, and we're deploying to long-running Node.

### Why Prisma (not Drizzle, raw pg, Kysely)

- **Type safety:** generated client gives full inference for `findMany({ include })`.
- **Migrations:** `prisma migrate` is well-tested and produces SQL we can review.
- **Pooling:** works cleanly with PgBouncer in transaction mode (Prisma 5 driver adapters fixed earlier prepared-statement issues).
- Rejected **Drizzle**: tighter perf and lower-level SQL control, but migrations are still maturing and the introspection story is weaker. Reconsider once Drizzle's migration tooling matches Prisma's.
- Rejected **raw pg / Kysely**: more boilerplate at our scale; the per-route savings don't justify giving up generated types.

The brief's "explicitly forbid raw SQL" is a wins-over-time choice. We codify it: the only escape hatch is `prisma.$queryRaw` wrapped in a named function under each module's `infrastructure/` layer, justified in a comment, and code-owned by senior reviewers.

### Why BullMQ

- Redis-backed (we already need Redis for caching + rate limiting); no extra infra.
- Repeatable jobs (cron-like), delayed jobs (e.g. "settle in T+1"), retries with backoff, dead-letter handling — all out of the box.
- Worker processes are separate from the API process; we ship the same Docker image with a different `command`.

### Why Pino

- Fastest structured logger on Node by a wide margin (async write, no JSON.stringify-in-hot-path).
- First-class integration with Fastify (`fastify.log` is Pino).
- JSON output → ships to any log aggregator (Loki, Elastic, CloudWatch, Datadog) with zero parsing.

### Result type — custom, not `neverthrow`

The brief specified `neverthrow`. We adopt the **shape** (`Result<T, E> = Ok<T> | Err<E>` with `.map`, `.match`, `.unwrapOr`) but **own the implementation** in `@zadpay/errors`. Reason: shared between mobile and API; we control the bundle cost on RN; we avoid the dependency taking a breaking change in the middle of the slice.

### Argon2id vs bcrypt for password hashing

- bcrypt is fine; argon2id is the modern recommendation (OWASP). We use **argon2id** via `@node-rs/argon2` (Rust binding, no native compile pain).
- Cost parameters: `m=19456, t=2, p=1` (OWASP defaults, tuned at startup against the prod CPU profile).

## Consequences

**Positive**
- Stack is mainstream, TS-native, observable, and CI-friendly.
- Throughput headroom is generous for the slice; no premature scale spend.
- Schema → validation → docs → types all derived from Zod.

**Negative**
- Two binary artifacts share one image (API + worker); operators need to know to run both. Documented in [ADR-0010](0010-cicd.md).
- Prisma's connection pooling has rough edges with serverless. We're not on serverless, so fine.

**Neutral / accept**
- tsyringe uses decorators (`@injectable`, `@inject`). They're tasteful here because DI containers benefit from declaration sites. We don't use decorators anywhere else (no Nest, no class-validator).

## Alternatives considered

1. **Bun.js + Hono.** Faster startup and per-request perf in micro-benchmarks. Ecosystem (Prisma, Sentry, OTel) compatibility is still moving. Risk too high for production money movement. Reconsider in 12 months.
2. **NestJS + TypeORM.** Tried-and-true enterprise stack. Heavier abstractions, harder microservice extraction. Rejected for this scope.
3. **Express + Sequelize + custom validators.** The "default" that loses on every individual axis: perf, types, docs, validation. Rejected.

## Rollout

PR-1 (after monorepo move):
- `apps/api/package.json` with the deps above.
- `apps/api/src/server.ts` — Fastify bootstrap (no business logic).
- `apps/api/src/infra/{config,logger,database,cache,queue,metrics}/` skeletons.
- `apps/api/prisma/schema.prisma` with empty datasource + the three module schema namespaces ([ADR-0005](0005-module-structure.md)).
- `apps/api/Dockerfile` (multi-stage; see [ADR-0010](0010-cicd.md)).
- `docker-compose.yml` at the repo root for local dev (Postgres + Redis only).

## Revisit when

- Sustained p95 latency > 200 ms at < 30% CPU → profile and consider lower-level HTTP (uWS) or splitting hot modules.
- Prisma becomes a bottleneck → drop down to Kysely for the offending repo's hot paths (it can coexist).
