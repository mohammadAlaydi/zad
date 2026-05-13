# Phase 0 — Audit Report

**Branch:** `claude/eloquent-hawking-6957f5`
**Audited:** 2026-05-13
**Scope:** Complete inventory of the existing demo, gap analysis against a production-ready React Native fintech app + Node.js backend (vertical slice: auth + KYC + money movement).

This document is the source of truth for what is real in the repo today, what the brief assumes that is not real, and what every subsequent PR is allowed to assume.

---

## 1. What this repo actually is

| Dimension         | Reality                                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| App type          | **Mobile** — Expo SDK 51 + React Native 0.74 + Hermes. Web export (`react-native-web` + `expo start --web`) exists but is not the product surface. |
| Routing           | `expo-router` 3.5 (file-based, typed routes enabled, [app.json:66-68](app.json)).                                                                  |
| Styling           | NativeWind 4 + Tailwind 3.4 ([tailwind.config.js](tailwind.config.js), [global.css](global.css), [metro.config.js](metro.config.js)).              |
| State             | Zustand 4.5, six stores in [src/store/](src/store): `appStore`, `merchantStore`, `adminStore`, `fraudStore`, `checkoutStore`, `supportStore`.      |
| Persistence       | `@react-native-async-storage/async-storage` 1.23 (plain key/value, not encrypted). Persisted via `zustand/middleware` `persist`.                   |
| Localization      | i18next + react-i18next, en + ar, with RTL toggling ([src/i18n/index.ts](src/i18n/index.ts)).                                                      |
| Animation/UX      | Reanimated 3.10, Moti 0.29, Lottie 6.7, expo-blur, expo-haptics.                                                                                   |
| Hardware          | expo-camera (KYC), expo-local-authentication (biometric), expo-linking.                                                                            |
| Native modules    | Local `react-native-worklets` package at [packages/react-native-worklets/](packages/react-native-worklets), plus `react-native-worklets-core` 1.3. |
| Architecture flag | **Old Architecture** (`newArchEnabled: false` in [app.json:9](app.json:9)).                                                                        |
| Source size       | 132 .ts/.tsx files. 26,169 LOC total. `app/` 976 KB, `src/` 220 KB, `assets/` 28 KB.                                                               |

### What is **not** in the repo

- **No backend code.** No `api/`, `server/`, `services/`, `backend/`, or `apps/api/` directory. Zero `fetch`/`axios` calls. All "API" responses are hardcoded into Zustand seed arrays (e.g. [src/store/appStore.ts:231-344](src/store/appStore.ts)).
- **No tests.** No `__tests__/`, no `*.spec.*`, no `*.test.*`. No Vitest/Jest/Detox/Maestro configuration.
- **No CI/CD.** No `.github/`, no `eas-build` profile customization, no Docker.
- **No ADRs, no architecture docs.** A `ZADPay_Dev_Plan.docx` exists in the root but is not consumable by tooling.
- **No environment configuration.** No `.env.example`, no env validation. Nothing to swap between dev / staging / prod.
- **No error tracking.** No Sentry, no error boundaries (I grep'd; zero usages of `componentDidCatch` or `ErrorBoundary`).
- **No telemetry.** No analytics, no structured logging, no request-ID propagation.
- **No service layer.** Components import Zustand actions directly; no HTTP client; no shared validation schemas.

### What the brief assumed that is wrong

| Brief assumption                                                                    | Reality                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Current bundle size is ~100MB"                                                     | Source code is **1.2 MB**. The 100MB is almost certainly the EAS-built **unsigned preview APK** (which is normal for an RN app with Hermes + JSC + Reanimated + Lottie + camera + worklets + full ABI set + no ProGuard). Different problem, different fixes. |
| "Lighthouse 95+ / WebP/AVIF / service workers / CSP / DOMPurify / httpOnly cookies" | Web-app concerns. Replaced with RN-equivalent targets (see [§5](#5-production-targets-revised-for-react-native)).                                                                                                                                             |
| "Refactor existing backend"                                                         | No backend to refactor. **Building it from scratch.**                                                                                                                                                                                                         |
| "Transform the demo into production"                                                | Realistic scope is the vertical slice (auth + KYC + money movement). 27 other domains stay as mobile-reference until they get their own backend module. See [module-inventory.md](module-inventory.md).                                                       |

---

## 2. Product surface — domain catalogue

The `app/` directory contains 32 top-level domains. This is a **fintech super-app**.

Mapped fully in [docs/module-inventory.md](module-inventory.md). High-level groups:

- **Core wallet**: home, accounts, expenses, settings, profile, notifications, onboarding, auth (login/signup/OTP/KYC capture).
- **Money movement**: send, receive, qr, scheduled, topup, bills, agent (cash-in/out), checkout, pos, nfc-pos.
- **Credit & investment**: bnpl, microloans, savings, goals, invest (stocks), crypto.
- **Cards**: virtual + physical issuing, ATM controls.
- **Merchant / admin / agent / payroll / loyalty / vouchers / insurance / marketing / fraud / support / whatsapp / learn**.

All of these run off seeded Zustand state today. There is no remote source of truth.

---

## 3. Concrete findings (by severity)

### S0 — Blockers for any production-grade money movement

1. **PCI exposure in card capture.** [app/topup/add-card.tsx:30-41](app/topup/add-card.tsx) reads raw PAN, expiry, and CVV into RN state and persists `last4 + name` to AsyncStorage. In production we never see the PAN; card entry must happen inside a processor SDK (Stripe Elements / Adyen Drop-in / Checkout.com Frames / the issuer's certified SDK) and we store only the returned network token. **Required fix:** replace with a tokenization SDK before any real money flows through this screen.
2. **`isAuthenticated` is a plain boolean in AsyncStorage** ([src/store/appStore.ts:507](src/store/appStore.ts:507)). A rooted/jailbroken device can edit AsyncStorage and flip auth. Required fix: derive auth state from presence + validity of a refresh token stored in `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android).
3. **Account balances live in AsyncStorage and are mutated client-side** ([src/store/appStore.ts:371-489](src/store/appStore.ts:371-489)). A user can edit local storage to mint money. The backend must own the ledger; client state is a cache, not the source of truth.
4. **No audit log, no idempotency keys, no double-entry bookkeeping.** Every money-moving action ([src/store/appStore.ts:382-489](src/store/appStore.ts:382-489)) is a single optimistic mutation. Required: every transfer is a server-side journal entry (debit + credit) with an idempotency key from the client and an immutable audit trail.
5. **No server-side authorisation.** RBAC is referenced in the brief but nothing exists. Required: roles + permissions enforced at the use-case layer on the backend; the mobile app shows/hides UI based on hints, never trusts itself.

### S1 — Architectural debt that blocks scaling the codebase

6. **No service layer.** Components import Zustand store actions directly. There is no place to put a real API client, retries, request IDs, or auth-header injection. Required: a typed `api/` package (Zod-validated, Result-typed) consumed by feature `services/`.
7. **One God store.** [src/store/appStore.ts](src/store/appStore.ts) is 531 lines and owns 18 domains (transactions, cards, agents, BNPL, vouchers, loyalty, goals, scheduled payments, savings, stocks, crypto, user). Should be one Zustand slice per feature; cross-feature state via React Query / server cache.
8. **Routing is flat, not feature-folder-organised.** [app/](app/) has 32 sibling dirs. Code (`src/`) and routes (`app/`) live in different trees, with no per-feature co-location of `components/`, `hooks/`, `services/`, `types/`.
9. **No error boundaries.** Any uncaught render error blacks out the whole app. Required: per-feature error boundary + a root boundary that reports to Sentry.
10. **No navigation guards.** [app/\_layout.tsx](app/_layout.tsx) renders a `<Stack>` with no auth check. The "logged-in" state is enforced only by which screen the user happens to land on. Required: a top-level guard that redirects on `isAuthenticated` / KYC status.
11. **Inline styles + raw `Colors.*` everywhere** while NativeWind is also in the project. Two parallel styling systems. Required: choose one (NativeWind, since it's already configured) and migrate.
12. **No async-action loading/error UI patterns.** Money-movement screens (e.g. [app/topup/payment.tsx](app/topup/payment.tsx), [app/send/](app/send/)) have no concept of "in flight", "failed", "retry". Required: every server-touching screen has explicit pending / error / success states wired through React Query.

### S2 — Operational gaps

13. **No tests.** Coverage target in the brief is 80%+; current is 0%. Required: Vitest + RTL for unit, Detox or Maestro for E2E on critical flows (login, send, receive, top-up, KYC submit).
14. **No CI.** Required: GitHub Actions matrix — typecheck, lint, test, EAS preview build on PR; EAS production build + Docker push on merge to `main`.
15. **No environment separation.** `eas.json` `production: {}` is empty. Required: `development` / `preview` / `production` profiles with distinct app IDs, API base URLs (via `expo-constants` `extra` + EAS env), and signing.
16. **Old RN architecture.** `newArchEnabled: false`. Fabric + TurboModules are 2-5x faster on screens with heavy gesture/animation (the whole app, basically). Migrate after the feature folders settle.
17. **No bundle/APK budget enforced.** Brief asked for <200 KB gzipped (web target, dropped). RN-appropriate budgets in [§5](#5-production-targets-revised-for-react-native) — needs CI enforcement.
18. **No image strategy.** PNG/SVG illustrations in [src/illustrations/](src/illustrations/) are inline RN components. OK for vector. For raster assets (none yet, but they're coming): use `expo-image`, AVIF/WebP, and prefetch on screens.
19. **Permissions are over-broad.** [app.json:27-35](app.json:27-35) declares CAMERA, RECORD_AUDIO, USE_BIOMETRIC, USE_FINGERPRINT. `RECORD_AUDIO` is not used by any code path I can find — should be removed. Each permission costs Play Store review friction.

### S3 — Code-hygiene wins (cheap)

20. **TS strict already on** ([tsconfig.json:4](tsconfig.json:4)) — good. Only 1 `: any` in the entire source tree. Keep it that way; turn on `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes` in the next PR.
21. **0 `console.*`** in source — good.
22. **1 TODO/FIXME** — basically none. Good.
23. **No ESLint config in the repo.** `expo lint` is the script but no `eslint.config.js` / `.eslintrc.*` is checked in. Required: shared config with `@typescript-eslint`, `eslint-plugin-react-native`, `eslint-plugin-react-hooks`, import-order, no-restricted-imports for cross-feature barrels.
24. **No Prettier, no Husky, no lint-staged.** Required.

---

## 4. Threat model — what an attacker can do today

| Attacker capability                                     | Today                               | After Phase 1                                                                               |
| ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Mint balance by editing AsyncStorage on a rooted device | ✅ Trivial                          | Impossible — ledger is server-side                                                          |
| Read PAN/CVV from memory dump during card entry         | ✅ Possible — values are in JS heap | Impossible — card entry inside processor SDK, our JS never sees it                          |
| Flip `isAuthenticated` to `true` without credentials    | ✅ Trivial                          | Impossible — auth is presence of valid refresh token in Keychain/EncryptedSharedPreferences |
| Replay a transfer request                               | ✅ Possible — no idempotency        | Blocked — idempotency keys at the API                                                       |
| Tamper with a transfer amount in transit                | ✅ Possible if no TLS pinning       | Blocked — TLS + cert pinning on the API client                                              |
| Read any user's data via the API                        | ⚪ N/A (no API)                     | Blocked — JWT subject claim + per-row authorisation in repositories                         |
| Brute-force OTP                                         | ⚪ N/A (no OTP server)              | Blocked — Redis sliding-window rate limit + lock-out + alerting                             |

---

## 5. Production targets (revised for React Native)

These replace the web-app targets in the brief. They are enforceable in CI.

| Metric                                                   | Target                               | How measured                                              |
| -------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| Cold start (TTI) on a mid-tier Android (Pixel 4a)        | < 2.0 s                              | Flashlight CI / RN Performance Marker                     |
| JS thread frame drops on home screen scroll              | < 1% over 60 s                       | Reanimated `useFrameCallback` recorded in dev runs        |
| Release APK size (universal, no ABI splits)              | < 80 MB                              | EAS build artefact `aapt2 dump badging`                   |
| Release APK size (per-ABI split)                         | < 35 MB per ABI                      | EAS build, enable `enableSeparateBuildPerCPUArchitecture` |
| Release IPA size                                         | < 70 MB                              | EAS build artefact                                        |
| Hermes bytecode size                                     | < 6 MB                               | `ls -la android/.../assets/index.android.bundle`          |
| JS bundle (uncompressed, prod, Hermes off for reference) | < 5 MB                               | `expo export --platform android`                          |
| Memory steady-state on home tab                          | < 250 MB                             | Xcode Instruments / Android Studio profiler               |
| API p95 latency (vertical-slice endpoints)               | < 200 ms (excluding processor calls) | Prometheus histogram, `/metrics`                          |
| API error rate                                           | < 0.5%                               | Prometheus, alerting at 1%                                |
| Crash-free sessions                                      | > 99.5%                              | Sentry                                                    |

---

## 6. What Phase 1 will and will not deliver

**Will deliver** (scope agreed):

- Mobile: monorepo split, feature-folder refactor, typed service layer, secure storage, navigation guards, auth flow wired to the backend, KYC flow wired to the backend, money-movement flows wired to the backend, error boundaries, Sentry, structured logging on critical paths, NativeWind-only styling, ESLint + Prettier + Husky, EAS profiles, GitHub Actions CI.
- Backend (vertical slice only): Fastify app, three modules (auth, KYC, money movement) implemented end-to-end (domain → application → infrastructure → interface), Prisma schemas, Postgres + Redis, BullMQ for async jobs, Pino structured logging, Prometheus metrics, OpenAPI from Zod, Docker, graceful shutdown, health checks, rate limiting, JWT + refresh rotation, RBAC, audit log, idempotency middleware.
- An in-process event bus with the shape of Kafka/RabbitMQ producer/consumer interfaces — **stubbed**, not connected to a real broker.

**Will not deliver:**

- The other 27 product domains. They stay running off the existing Zustand seeds. Each will get its own backend module in a follow-up.
- A real card-issuing/processor integration. We design for it (adapter pattern, tokenization) but do not wire a vendor.
- Compliance artefacts (PCI ROC, SOC2, KYC SaaS contract, banking licence). Engineering-only per the brief.
- Push notifications (FCM/APNs wiring).
- Real-time features (WebSocket, presence) — designed-for, not built.

---

## 7. Decision log — what was decided to get to Phase 1

| #   | Decision                                                                                                                                       | Why                                                                                          | ADR                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Mobile-first, drop web-app targets                                                                                                             | The product is the mobile app; web export is incidental                                      | [adr/0001](adr/0001-platform-target.md)              |
| 2   | pnpm monorepo: `apps/mobile`, `apps/api`, `packages/shared-*`                                                                                  | Share Zod schemas + types end-to-end; enable per-app build/test                              | [adr/0002](adr/0002-monorepo-layout.md)              |
| 3   | Feature-folder mobile architecture; Zustand for client state, React Query for server state                                                     | Co-locate by domain; remove the God store; clean async UX                                    | [adr/0003](adr/0003-mobile-architecture.md)          |
| 4   | Fastify + Prisma + Postgres + Redis + BullMQ + Pino + Zod                                                                                      | Highest throughput TS-native HTTP stack with the lowest accidental complexity for this scope | [adr/0004](adr/0004-backend-stack.md)                |
| 5   | Hexagonal modules; cross-module communication via internal event bus; no cross-module imports                                                  | Extraction-ready monolith                                                                    | [adr/0005](adr/0005-module-structure.md)             |
| 6   | JWT (15m) + refresh (7d) with rotation + replay detection; tokens in `expo-secure-store`; biometric unlock                                     | Industry standard for mobile fintech                                                         | [adr/0006](adr/0006-auth-secrets.md)                 |
| 7   | Double-entry ledger; `Money` value object; idempotency keys; transactional `BEGIN ... COMMIT` per movement                                     | Money correctness is non-negotiable                                                          | [adr/0007](adr/0007-money-movement.md)               |
| 8   | KYC: provider-adapter pattern; status machine `pending → submitted → review → approved\|rejected`; documents in S3 with server-side encryption | Pluggable vendors (Sumsub, Onfido, Veriff)                                                   | [adr/0008](adr/0008-kyc.md)                          |
| 9   | Pino + Prometheus + Sentry; `Result<T, E>` not exceptions for expected errors; Vitest + Supertest + Detox                                      | Observability is shippable from day one                                                      | [adr/0009](adr/0009-observability-errors-testing.md) |
| 10  | GitHub Actions; Docker for API; EAS for mobile; required checks: typecheck, lint, test, build, audit                                           | Pipeline blocks regressions                                                                  | [adr/0010](adr/0010-cicd.md)                         |

---

## 8. Risk register (carried into Phase 1)

| Risk                                                                                                     | Likelihood | Impact   | Mitigation                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------- |
| Vendor lock-in for card processor                                                                        | Medium     | High     | Adapter pattern; no processor types leak out of `payments/` infrastructure                         |
| Ledger correctness bugs                                                                                  | Medium     | Critical | Property-based tests on the ledger; reconciliation job nightly                                     |
| Reanimated worklet crashes during migration to New Arch                                                  | Medium     | Medium   | Defer New Arch flip until after vertical slice is green                                            |
| EAS quota / build minutes on free tier                                                                   | Low        | Medium   | Cache; only build on `main` and PRs touching mobile                                                |
| Compliance scope creep blocking engineering                                                              | Medium     | High     | Engineering ships to PCI-compatible patterns and stops there (per brief)                           |
| Local `react-native-worklets` fork in [packages/react-native-worklets/](packages/react-native-worklets/) | Unknown    | Medium   | Investigate — if it's just a `pickFirst` shim, document; if it's patched code, write an ADR for it |

---

**End of Phase 0 audit.** All subsequent PRs reference findings here by number (e.g. "addresses S0-1 and S1-7").
