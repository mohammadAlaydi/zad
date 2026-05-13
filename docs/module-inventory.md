# Module Inventory & Extraction Sequence

Inventory of every product domain present in the mobile app, mapped to backend modules and ordered by extraction priority. The first three are **in scope for Phase 1** (vertical slice). Everything else is documented here so that follow-up PRs have a clear queue, not so we build it now.

Each row links to where it lives in the mobile app today and (when scaffolded) the corresponding backend module.

---

## Phase 1 — vertical slice (this engagement)

| # | Module | Mobile surface | Backend module path | Depends on |
|---|---|---|---|---|
| 1 | **Identity / Auth** | [app/(auth)/](app/(auth)/) — login, signup, OTP, passcode | `apps/api/src/modules/identity` | — |
| 2 | **KYC** | [app/(auth)/id-capture.tsx](app/(auth)/id-capture.tsx), [id-scan.tsx](app/(auth)/id-scan.tsx), [selfie.tsx](app/(auth)/selfie.tsx), [personal-info.tsx](app/(auth)/personal-info.tsx), [address.tsx](app/(auth)/address.tsx) | `apps/api/src/modules/kyc` | identity |
| 3 | **Wallet & Ledger** | [app/(tabs)/home.tsx](app/(tabs)/home.tsx), [app/send/](app/send/), [app/receive/](app/receive/), [app/(tabs)/expenses.tsx](app/(tabs)/expenses.tsx) | `apps/api/src/modules/wallet` | identity, kyc |

The **event bus** is stubbed in `apps/api/src/shared/events/` with a Kafka-compatible producer/consumer interface (`publish`, `subscribe`, `at-least-once`). In Phase 1 it is an in-process EventEmitter. Swap to Kafka or RabbitMQ is a config change in [ADR-0005](adr/0005-module-structure.md).

---

## Phase 2 candidates — extract next (not built now)

Ordered by dependency depth from the vertical slice.

| # | Module | Mobile surface | Backend module (future) | Notes |
|---|---|---|---|---|
| 4 | Cards | [app/cards/](app/cards/), [app/settings/cards.tsx](app/settings/cards.tsx) | `modules/cards` | Issuer adapter (Marqeta-style). Tokenized PAN only. |
| 5 | Top-up | [app/topup/](app/topup/) | `modules/topup` | Calls `payments` adapter (Stripe/Adyen/Checkout.com). |
| 6 | QR pay | [app/qr/](app/qr/) | `modules/qr` | Generates short-lived signed QR payloads. |
| 7 | Bills | [app/bills/](app/bills/) | `modules/billers` | Biller-aggregator adapter. |
| 8 | Scheduled payments | [app/scheduled/](app/scheduled/) | `modules/scheduling` | BullMQ repeatable jobs. |
| 9 | Agent banking (cash-in/out) | [app/agent/](app/agent/) | `modules/agents` | Geo, float management, reconciliation. |
| 10 | Checkout (web/marketplace) | [app/checkout/](app/checkout/) | `modules/checkout` | Hosted checkout endpoint. |
| 11 | POS / NFC-POS | [app/pos/](app/pos/), [app/nfc-pos/](app/nfc-pos/) | `modules/pos` | Terminal-API contracts. |
| 12 | Fraud & risk | [app/fraud/](app/fraud/), [src/store/fraudStore.ts](src/store/fraudStore.ts) | `modules/risk` | Listens to `wallet` events; rules engine. |
| 13 | Vouchers | [app/vouchers/](app/vouchers/) | `modules/vouchers` | Code generation, redemption ledger. |
| 14 | Loyalty | [app/loyalty/](app/loyalty/) | `modules/loyalty` | Points ledger, tier rules. |
| 15 | Goals | [app/goals/](app/goals/) | `modules/goals` | Sub-ledger over `wallet`. |
| 16 | Savings | [app/savings/](app/savings/) | `modules/savings` | Interest accrual cron. |
| 17 | BNPL | [app/bnpl/](app/bnpl/) | `modules/bnpl` | Underwriting adapter, repayment schedule. |
| 18 | Microloans | [app/microloans/](app/microloans/) | `modules/microloans` | Underwriting adapter, amortization. |
| 19 | Insurance | [app/insurance/](app/insurance/) | `modules/insurance` | Insurer adapter, policy lifecycle. |
| 20 | Invest (stocks) | [app/invest/](app/invest/) | `modules/invest` | Broker adapter (Alpaca-style). |
| 21 | Crypto | [app/crypto/](app/crypto/) | `modules/crypto` | Custodian adapter. |
| 22 | Payroll | [app/payroll/](app/payroll/) | `modules/payroll` | Batch disbursement over `wallet`. |
| 23 | Merchant | [app/merchant/](app/merchant/), [src/store/merchantStore.ts](src/store/merchantStore.ts) | `modules/merchants` | Merchant onboarding, settlement. |
| 24 | Admin | [app/admin/](app/admin/), [src/store/adminStore.ts](src/store/adminStore.ts) | `modules/admin` | Internal back-office; separate auth realm. |
| 25 | Support | [app/support/](app/support/), [src/store/supportStore.ts](src/store/supportStore.ts) | `modules/support` | Ticketing adapter (Zendesk/Intercom). |
| 26 | Marketing | [app/marketing/](app/marketing/) | `modules/marketing` | Campaign engine; mostly CMS. |
| 27 | Learn (content) | [app/learn/](app/learn/) | `modules/content` | Content adapter (Strapi/Contentful). |
| 28 | WhatsApp bot / channel | [app/whatsapp/](app/whatsapp/) | `modules/messaging` | Twilio adapter; channel-agnostic. |
| 29 | Notifications | [app/notifications.tsx](app/notifications.tsx) | `modules/notifications` | FCM/APNs adapter, preference centre. |
| 30 | Profile / settings | [app/profile/](app/profile/), [app/settings/](app/settings/) | `modules/profile` | Thin over `identity` + preferences. |

---

## Cross-cutting (no business domain, must exist)

These are not "modules" in the bounded-context sense; they're platform concerns. Each has a home under `apps/api/src/shared/` or `apps/api/src/infra/`.

| Concern | Home | Phase |
|---|---|---|
| Auth middleware (JWT verify) | `shared/middleware/auth.ts` | Phase 1 |
| Request context (request ID, user, tenant) | `shared/middleware/context.ts` | Phase 1 |
| Idempotency | `shared/middleware/idempotency.ts` | Phase 1 |
| Rate limiting | `shared/middleware/rate-limit.ts` | Phase 1 |
| Audit log | `shared/audit/` | Phase 1 |
| Event bus | `shared/events/` | Phase 1 (in-proc stub) |
| Error handler + Result type | `shared/errors/` | Phase 1 |
| Cache service (typed Redis wrapper) | `infra/cache/` | Phase 1 |
| Queue service (BullMQ wrapper) | `infra/queue/` | Phase 1 |
| Database (Prisma client) | `infra/database/` | Phase 1 |
| Config (Zod env schema) | `infra/config/` | Phase 1 |
| Logger (Pino) | `infra/logger/` | Phase 1 |
| Metrics (Prometheus) | `infra/metrics/` | Phase 1 |
| Outbox pattern (transactional event publish) | `shared/events/outbox.ts` | Phase 1 stub, full impl Phase 2 |

---

## Extraction order (when this monolith becomes microservices)

Driven by data-ownership boundaries and operational pressure:

1. **`payments` first** (when added in Phase 2). Calls external processors; isolation reduces blast radius.
2. **`risk` second.** Read-only consumer of events; extract trivially.
3. **`identity`.** Stable contract; extract once external IDPs are integrated.
4. **`wallet`.** Last to extract from the core — its database is the source of truth and migration is the highest-stakes operation.
5. Domain-specific modules (`bnpl`, `microloans`, `invest`, `crypto`) extract independently as throughput justifies.

The rule that makes this possible: **no cross-module DB foreign keys, ever.** A module that wants to reference another module's entity stores the ID and asks via the event bus (or a published RPC). See [ADR-0005](adr/0005-module-structure.md).
