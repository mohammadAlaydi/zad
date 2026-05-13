# ADR-0005: Backend module structure — hexagonal, no cross-imports, stubbed event bus

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** backend

## Context

The brief specifies a "modular monolith ready to extract to microservices with zero rewrites of business logic." This is the most architecturally consequential decision in the slice; getting it right means future extraction is a `git mv` + a deploy; getting it wrong means a multi-quarter rewrite.

Phase 1 scope: 3 modules (identity, kyc, wallet), plus the event-bus stub.

Audit reference: [audit §7 #5](../audit.md), [module-inventory.md](../module-inventory.md).

## Decision

### Per-module layout (hexagonal / clean architecture)

```
apps/api/src/modules/<bounded-context>/
├── domain/                      # PURE TS — no framework, no I/O, no Prisma
│   ├── entities/                # AggregateRoot subclasses; invariants enforced here
│   ├── value-objects/           # Money, Email, PhoneNumber, IdempotencyKey
│   ├── events/                  # DomainEvent subclasses (data, no behaviour)
│   ├── errors/                  # Domain errors (e.g. InsufficientBalance)
│   └── ports/                   # Repository interfaces, gateway interfaces
├── application/                 # Use cases (commands & queries) — orchestrates domain + ports
│   ├── commands/                # one file per command, e.g. CreateTransfer.ts
│   ├── queries/                 # read-side projections (CQRS-lite)
│   └── policies/                # cross-aggregate domain services (e.g. risk-limits.policy.ts)
├── infrastructure/              # Implementations of ports + framework adapters
│   ├── repositories/            # Prisma-backed repos implementing domain/ports
│   ├── adapters/                # external service adapters (sumsub.adapter.ts, fcm.adapter.ts)
│   ├── projections/             # event handlers that update read models
│   └── prisma/                  # Prisma model file fragments for this module's schema namespace
└── interface/                   # HTTP layer — Fastify routes + controllers + schemas
    ├── routes.ts                # registers routes onto the Fastify instance
    ├── controllers/             # thin: parse, call use case, serialize
    ├── schemas/                 # Zod schemas (request, response, params)
    └── openapi.ts               # contributes to the global OpenAPI doc
```

### The five non-negotiables

1. **No cross-module imports of internals.** A module exposes a `index.ts` barrel that re-exports only:
   - Its public events (`events/`)
   - Its public commands (occasionally, when another module needs synchronous orchestration)
   - **Nothing else.**
     ESLint rule: `no-restricted-imports` forbids `../<other-module>/(domain|application|infrastructure|interface)/**` everywhere. The only allowed cross-module path is `../<other-module>` (which resolves to the barrel).

2. **No DB foreign keys across module boundaries.** Each module owns a Postgres **schema namespace**:
   - `identity.*` tables
   - `kyc.*` tables
   - `wallet.*` tables
   - `shared.*` (audit log, idempotency keys, event outbox)
     References across schemas are by ID + an event-driven invariant, not by FK. The Prisma schema is split into multiple `*.prisma` fragments and merged via the multi-file feature (Prisma 5.15+).

3. **Cross-module communication via the internal event bus.** Direct cross-module function calls are an architectural smell. The event bus interface lives at `apps/api/src/shared/events/bus.ts`:

   ```ts
   export interface EventBus {
     publish<E extends DomainEvent>(event: E): Promise<void>;
     subscribe<E extends DomainEvent>(name: E["name"], handler: (e: E) => Promise<void>): void;
   }
   ```

   Phase 1 implementation: in-process `EventEmitter`-backed bus + a **transactional outbox** table (`shared.event_outbox`) so that publishing an event is part of the same DB transaction as the state change. A background worker reads the outbox and dispatches to in-process subscribers.

   When we extract to microservices: swap the bus implementation for a Kafka/RabbitMQ producer; the outbox table becomes the producer's source of truth (this pattern is known as "transactional outbox" and is the only correct way to publish without losing or duplicating events).

4. **Repository interfaces are the only thing that touches a module's tables.** No other module queries another module's tables — even read-only. If `risk` needs a wallet balance, it asks the `wallet` module via a query (in-process today, RPC tomorrow). No `SELECT FROM wallet.accounts` in the risk module.

5. **Use cases (commands) are transactional and idempotent.**
   - Each command handler runs in a Prisma `$transaction`.
   - Each command accepts an `idempotencyKey` (UUID v4). The shared idempotency middleware stores `{key, response, status}` in Redis with a 24h TTL; a duplicate key returns the cached response.

### Module barrel example

```ts
// apps/api/src/modules/wallet/index.ts
export { TransferCreatedEvent, TransferFailedEvent } from "./domain/events";
// commands are exposed when another module needs synchronous orchestration
export { CreateTransferCommand } from "./application/commands/CreateTransfer";
export type { Money } from "./domain/value-objects/Money";
// nothing else is exported.
```

### Result type at the use-case boundary

```ts
// application/commands/CreateTransfer.ts
export class CreateTransferCommand {
  constructor(
    private readonly deps: {
      accounts: AccountRepository; // a port
      ledger: LedgerRepository; // a port
      events: EventBus;
      clock: Clock; // injected for testability
    },
  ) {}

  async execute(input: CreateTransferInput): Promise<Result<TransferResult, TransferError>> {
    // 1. Load aggregates via repos
    // 2. Invoke domain methods that enforce invariants
    // 3. Persist via repos (inside a $transaction)
    // 4. Publish events (via outbox, in same $transaction)
    // 5. Return Result
  }
}
```

Exceptions are reserved for **unexpected** failures (DB down, malformed config). Expected failures (`InsufficientBalance`, `KycNotApproved`) return `Err(...)`. The HTTP layer maps both to status codes.

### Dependency injection

`tsyringe` with constructor injection. The composition root is `apps/api/src/server.ts`:

```ts
container.register<EventBus>("EventBus", { useClass: InProcessEventBus });
container.register<AccountRepository>("AccountRepository", { useClass: PrismaAccountRepository });
// ... per module ...

const app = await buildApp(container);
```

Each module exports a `register(container, fastify)` function — the only entry point a module exposes to the composition root. This keeps the root tiny and the modules self-contained.

## Consequences

**Positive**

- Extraction = take a module folder + its Prisma schema fragment + its shared deps → new repo. The HTTP layer ports trivially because Fastify routes are just functions. The event bus swap is a one-line change in the composition root.
- Test isolation: a module's `domain/` and `application/` tests need no Postgres, no Redis, no Fastify. Repositories are mocked via the ports.
- Reviewing a PR scoped to one module is bounded.

**Negative**

- Boilerplate. Every domain entity has a value object, a repo interface, a repo implementation, a use case, a route. We accept this — the cost is paid once per module and saves orders of magnitude when extracting.
- The transactional outbox adds a write per published event. Negligible at the volumes we're targeting; if it becomes a bottleneck, batch the dispatcher.

**Neutral / accept**

- New engineers need an hour-long walkthrough to understand the layering. Documented in this ADR and in `docs/onboarding.md` (future).

## Alternatives considered

1. **Layered (controllers / services / repos) without ports.** Fewer abstractions; tighter coupling. The whole point of this ADR is extraction-readiness, which a layered approach surrenders.
2. **Per-feature folders without domain/application split** (the "transaction script" style — one file per HTTP route doing everything). Fast for CRUD; collapses under the weight of money-movement invariants. Rejected for this scope.
3. **Microservices from day one.** Multi-cluster, multi-deploy, distributed-transaction nightmare for a 3-module slice. Rejected.

## Rollout

PR-2 (after the backend stack PR):

- `apps/api/src/modules/identity/` skeleton (domain/application/infrastructure/interface).
- `apps/api/src/modules/kyc/` skeleton.
- `apps/api/src/modules/wallet/` skeleton.
- `apps/api/src/shared/events/{bus.ts,outbox.ts}` — in-process + outbox.
- `apps/api/src/shared/middleware/{auth,context,idempotency,rate-limit,error}.ts`.
- `apps/api/src/server.ts` — composition root, `container.register()` calls.
- Prisma schemas split per module with `schemas = ["identity", "kyc", "wallet", "shared"]`.

Subsequent PRs flesh out each module (auth flows, KYC submission, transfer endpoint).

## Revisit when

- A module is extracted to its own service. The lessons from the first extraction inform whether the in-process event bus needs to become Kafka, NATS, or a managed alternative.
- A second module needs to **synchronously** call into another module's command (currently allowed but rare). If this happens twice, introduce an explicit `RPC` port type — don't let direct command imports proliferate.
