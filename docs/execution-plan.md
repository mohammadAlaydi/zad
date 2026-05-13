# Phase 1 Execution Plan — Vertical Slice

This is the PR-by-PR roadmap. Each PR is **small enough to review in under an hour**, each is independently revertable, and each has an explicit acceptance test. PRs are ordered by dependency, not by priority.

**Scope (locked):** mobile-first, vertical slice on the backend (auth + KYC + wallet), event bus stubbed, compliance scaffolding deferred.

**Convention:** every PR title starts with `[scope] action` where `scope` ∈ `repo`, `mobile`, `api`, `shared`, `ci`, `docs`. Each PR references audit findings by their S0/S1/S2 number.

---

## Stream A — Foundations (must finish before Stream B starts)

### PR-0 · `[repo] move to pnpm monorepo`

- Status quo → `apps/mobile/*`, `apps/api/` empty, `packages/shared-*` empty, `pnpm-workspace.yaml`.
- Update [metro.config.js](../../metro.config.js), [tsconfig.json](../../tsconfig.json), [eas.json](../../eas.json) so Metro/Expo continue to work after the move.
- Acceptance: `pnpm --filter @zadpay/mobile start` boots; `pnpm --filter @zadpay/mobile run android` builds; no source change to any feature.
- Addresses: ADR-0002.

### PR-1 · `[shared] create shared-types, shared-validation, shared-errors`

- Empty packages with `package.json`, `tsconfig.json`, `index.ts`. Exports `Money` (skeleton), `Result`, `AppError` hierarchy. Zero consumers yet.
- Acceptance: `pnpm -r build` green.
- Addresses: ADR-0002, ADR-0007, ADR-0009.

### PR-2 · `[api] scaffold Fastify + infra + cross-cutting middleware`

- `apps/api/src/{server.ts,app.ts}` Fastify bootstrap.
- `apps/api/src/infra/{config,logger,database,cache,queue,metrics}/` skeletons.
- `apps/api/src/shared/{errors,events,middleware,audit}/` skeletons + in-process EventBus stub + transactional outbox table.
- Prisma schema namespaces declared: `identity`, `kyc`, `wallet`, `shared`. **No models yet** beyond `shared.event_outbox`, `shared.audit_log`, `shared.idempotency_keys`.
- `/health/live`, `/health/ready`, `/metrics`, request-context, error handler, Pino, Sentry init.
- Dockerfile + `docker-compose.yml` (Postgres + Redis).
- Acceptance: `docker compose up`, then `pnpm --filter @zadpay/api dev` boots; `curl /health/ready` returns 200.
- Addresses: S1-9, S2-15, ADR-0004, ADR-0005, ADR-0009.

### PR-3 · `[ci] required-checks workflow`

- `.github/workflows/ci.yml` with: typecheck, lint, prettier, audit, test-unit (no integration yet — no tests yet).
- Prettier + ESLint configs at the root (`@typescript-eslint`, import-order, `no-restricted-imports`).
- Husky + lint-staged + commitlint.
- Acceptance: empty PR shows all green checks.
- Addresses: S2-14, S3-23, S3-24, ADR-0010.

---

## Stream B — Identity & Auth (Wallet & KYC depend on this)

### PR-4 · `[api] identity module: login + refresh + logout + /me`

- `apps/api/src/modules/identity/{domain,application,infrastructure,interface}/` per [ADR-0005](adr/0005-module-structure.md).
- Prisma models: `identity.users`, `identity.refresh_tokens`.
- Argon2id password hashing; Ed25519 JWT; refresh-token rotation with family revocation on replay.
- Vitest unit tests on `domain/` and `application/`; Supertest integration tests with Testcontainers Postgres.
- OpenAPI doc generated from Zod schemas.
- Acceptance: full login → refresh → reuse-old-refresh → family-revocation path covered by integration tests.
- Addresses: S0-2, S0-5, ADR-0006.

### PR-5 · `[mobile] auth feature migration + SecureStore + nav guard rewrite`

- Migrate `app/(auth)/*` consumers to `src/features/auth/*`.
- New typed API client at `src/lib/api/client.ts` (Result-typed, Zod-validated).
- Refresh interceptor (single-flight).
- `expo-secure-store` for refresh token; in-memory access token; biometric unlock via `expo-local-authentication`.
- Replace `isAuthenticated: boolean` in [appStore.ts](../../src/store/appStore.ts) with derived session state. Remove from `partialize`.
- Root nav guard in `app/_layout.tsx`.
- Acceptance: login flow against PR-4's API on a real device. Force-quit + relaunch + biometric → resumes session.
- Addresses: S0-2, S1-10, ADR-0003, ADR-0006.

---

## Stream C — KYC

### PR-6 · `[api] kyc module: applications + documents + InMemoryProvider`

- Module skeleton per [ADR-0005](adr/0005-module-structure.md).
- Prisma models: `kyc.applications`, `kyc.documents`.
- State machine in `KycApplication` aggregate.
- `KycProvider` port + `InMemoryKycProvider` (auto-approve after a delay, configurable per env).
- S3 client wrapper + presign endpoint (`POST /v1/kyc/documents/presign`).
- Webhook receiver scaffolding (signature verification, idempotency).
- Tests: state-machine transitions, presign URL is short-lived and scoped.
- Acceptance: full submit → in-memory-approve → status `approved` → user's JWT includes `kyc_status=approved` after next refresh.
- Addresses: ADR-0008.

### PR-7 · `[mobile] kyc feature migration`

- Migrate `app/(auth)/id-capture.tsx`, `id-scan.tsx`, `selfie.tsx`, `personal-info.tsx`, `address.tsx` consumers into `src/features/kyc/*`.
- Wire presign + direct-to-S3 upload + notify.
- Status polling (replace with push subscription post-Phase-1).
- Loading / error / retry UX on every step.
- Acceptance: real-device run: capture → upload → submit → see status update → land on home.
- Addresses: ADR-0003, ADR-0008.

---

## Stream D — Wallet

### PR-8 · `[shared] Money value object + currency precision + Zod schemas`

- `packages/shared-types/src/Money.ts` — full implementation per [ADR-0007](adr/0007-money-movement.md).
- `packages/shared-validation/src/wallet/*` — request/response schemas for the wallet endpoints.
- Vitest unit tests on `Money` (property-based via fast-check).
- Acceptance: `Money.add`, `sub`, `cmp`, `JSON.stringify` round-trip property tests pass at N=10_000.
- Addresses: ADR-0007.

### PR-9 · `[api] wallet module: accounts, ledger, balance projection`

- Prisma models: `wallet.accounts`, `wallet.transactions`, `wallet.ledger_entries`, `wallet.account_balances` (projection).
- Ledger imbalance trigger.
- Idempotency middleware (Redis + DB unique constraint).
- `GET /v1/wallet/accounts`, `GET /v1/wallet/accounts/:id/balance`, `GET /v1/wallet/transactions`.
- Acceptance: a seeded account returns a balance; transactions list paginates.
- Addresses: S0-3, S0-4, ADR-0007.

### PR-10 · `[api] wallet transfers + property-based ledger tests`

- `POST /v1/wallet/transfers` — full domain → use case → repo → route stack.
- `CreateTransferCommand` enforces invariants (no negative without overdraft, currency match).
- Posts to event bus: `TransferCreated`, `TransferPosted`, `TransferFailed` (via outbox).
- Property-based tests: for any sequence of valid transfers, total ledger sum per transaction = 0; balance projection = sum query.
- Acceptance: 10k property runs green; concurrent transfer test under `FOR UPDATE` lock shows no negative balance.
- Addresses: S0-3, S0-4, ADR-0007.

### PR-11 · `[api] wallet top-ups + withdrawals (stub PaymentProcessor)`

- `POST /v1/wallet/topups`, `POST /v1/wallet/withdrawals`.
- `PaymentProcessor` port; in-memory implementation returns success with a fake processor ref.
- Two-phase posting via `reserve` account.
- Acceptance: top-up balance change visible; reverse via admin endpoint puts compensating entries.
- Addresses: ADR-0007.

### PR-12 · `[mobile] wallet feature migration: home, send, receive, expenses`

- Migrate `app/(tabs)/home.tsx`, `app/send/*`, `app/receive/*`, `app/(tabs)/expenses.tsx` into `src/features/wallet/*`.
- Remove `balances`, `transactions`, `addTransaction`, money-mutating actions from [appStore.ts](../../src/store/appStore.ts). All these become React Query queries / mutations against `/v1/wallet/*`.
- Per-flow Idempotency-Key generation (UUID v4 on screen mount; persists during the flow).
- Loading skeleton + error states on every screen.
- Replace [topup/add-card.tsx](../../app/topup/add-card.tsx) raw card capture with a **placeholder** "card processor SDK goes here" screen + a TODO ADR pointer; the demo flow is broken on purpose until a real processor adapter is wired. (Documented as S0-1 not-yet-fixed; in scope for Phase 2.)
- Acceptance: send $5 from device A to device B on staging, observe new transaction on both ends, observe a `wallet_transactions_total{type=transfer,status=posted}` metric increment.
- Addresses: S0-1 (partial — replaces unsafe flow with stub), S0-3, S0-4, S1-12.

---

## Stream E — Polish & release pipeline

### PR-13 · `[mobile] error boundaries, Sentry, structured logging, NativeWind cleanup`

- Per-feature error boundary + root boundary.
- `@sentry/react-native` init in `src/app/providers.tsx`.
- Source-map upload in EAS post-install hook.
- Replace inline-style `Colors.*` usages with NativeWind classes in the migrated features (`auth`, `kyc`, `wallet`). Other features marked `// TODO(adr-0003): migrate to NativeWind` and ESLint flags them.
- Permissions cleanup: drop unused `RECORD_AUDIO` from [app.json:27-35](../../app.json:27-35).
- Acceptance: a forced `throw` in the wallet feature renders the recoverable UI and creates a Sentry event with the correct tags.
- Addresses: S1-9, S1-11, S2-18, S2-19.

### PR-14 · `[mobile] Maestro E2E flows + bundle-size budget in CI`

- `e2e/maestro/{login,kyc,topup-stub,send,receive}.yaml`.
- `mobile-bundle-size` CI job from [ADR-0010](adr/0010-cicd.md) — fails build if Hermes bytecode > 6 MB.
- Acceptance: Maestro Cloud (or local emulator in CI) runs all five flows green on every PR that touches mobile.
- Addresses: S2-13, ADR-0010.

### PR-15 · `[api] release pipeline + EAS production profile`

- `.github/workflows/api-release.yml` (Docker build, push to GHCR, staging deploy, smoke, manual prod gate).
- `.github/workflows/mobile-release.yml` (EAS production builds, source map upload).
- [eas.json](../../eas.json) `production` profile populated; environment variables wired.
- Acceptance: merge to `main` produces a tagged image and a TestFlight-eligible IPA.
- Addresses: S2-14, S2-15, ADR-0010.

---

## Out-of-scope this slice (documented, not built)

- The remaining 27 mobile features stay running on Zustand seeds. ESLint lets them; the migration story is in [module-inventory.md](module-inventory.md).
- Real card processor (Stripe/Adyen/Checkout.com) adapter — Phase 2.
- Real KYC provider (Sumsub/Onfido) adapter — Phase 2 (the port and webhook scaffolding land in this slice so the integration is mechanical).
- Push notifications.
- New React Native Architecture (Fabric/TurboModules) — flip the flag after the slice is green.
- OpenTelemetry exporters — instrumentation lands now, exporter when there's a tracing backend to point at.
- Real card data flow: the demo's `add-card.tsx` is **replaced with a stub** in PR-12 to remove the PCI exposure. The proper tokenization flow is Phase 2.
- Admin-side audit log viewer.
- Compliance artefacts (PCI ROC, SOC2, KYC SaaS contract, banking licence).

---

## Estimated effort & order

15 PRs, ordered to minimise blocking:

```
Day 1-2:  PR-0, PR-1 (foundations)
Day 2-3:  PR-2 (api scaffold) ─┬── PR-3 (CI) in parallel
Day 4-6:  PR-4 (identity api) ─┴── PR-8 (shared Money) in parallel
Day 6-8:  PR-5 (mobile auth)
Day 8-10: PR-6 (kyc api) ──────── PR-9 (wallet api accounts)
Day 10-12: PR-7 (mobile kyc) ─── PR-10 (wallet transfers)
Day 12-14: PR-11 (topups), PR-12 (mobile wallet)
Day 14-15: PR-13, PR-14, PR-15
```

Two pairs working in parallel: one on `api`, one on `mobile`. A solo engineer would serialise and roughly double the calendar time.

---

## Acceptance for Phase 1 as a whole

The slice ships when **all** of these are true:

- [ ] Mobile login → KYC submit → KYC approve (in-memory) → top-up → send → receive flows work end-to-end against the staging API.
- [ ] No money mutation happens in client state. Every balance read goes through the API. Verified by deleting AsyncStorage on a device — balances reload from server.
- [ ] An attacker who edits AsyncStorage gets bounced at the nav guard (no valid refresh token) or at the API (token rejected).
- [ ] `expo-secure-store` holds the refresh token; AsyncStorage does not.
- [ ] Sentry receives a test exception from both mobile and API with source-mapped stack traces.
- [ ] `/metrics` is scrapeable in staging; `wallet_ledger_imbalance_total` is 0 under property-test load.
- [ ] CI green on a fresh PR: typecheck, lint, prettier, unit, integration, audit, bundle-size.
- [ ] Maestro flows pass against a staging EAS preview build.
- [ ] No `: any` in any new code. No `console.*` in any new code. No raw SQL outside named escape hatches.
- [ ] Each ADR linked has a corresponding row in the [audit](audit.md)'s decision log marked **Accepted**.
- [ ] [README](../README.md) updated with: monorepo bootstrap, local dev steps, env vars, deployment overview (link to ADR-0010).
