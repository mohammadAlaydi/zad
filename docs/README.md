# ZADPAY — Engineering Docs

This directory is the single source of truth for the production rebuild of ZADPAY. Read in this order:

1. **[Phase 0 Audit](audit.md)** — what's actually in the repo, what's missing, what the brief assumed that wasn't true. Findings are numbered (S0/S1/S2); every subsequent PR references them.
2. **[Module Inventory](module-inventory.md)** — the 30 product domains, what's in scope for the slice, what's deferred, and the extraction order to microservices later.
3. **[Execution Plan](execution-plan.md)** — the 15-PR roadmap that takes us from the current demo to a shipped vertical slice.

The architectural decisions are recorded as ADRs. Each is short, opinionated, and dated; supersede with a new ADR rather than editing in place.

| #                                                | Title                                                                     | Tags                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------- |
| [0000](adr/0000-template.md)                     | ADR template                                                              | —                         |
| [0001](adr/0001-platform-target.md)              | Platform target — mobile-first, drop web-app targets                      | mobile                    |
| [0002](adr/0002-monorepo-layout.md)              | Monorepo layout — pnpm workspaces                                         | ops, mobile, backend      |
| [0003](adr/0003-mobile-architecture.md)          | Mobile architecture — feature folders, split state, typed service layer   | mobile                    |
| [0004](adr/0004-backend-stack.md)                | Backend stack — Fastify + Prisma + Postgres + Redis + BullMQ + Pino + Zod | backend                   |
| [0005](adr/0005-module-structure.md)             | Backend module structure — hexagonal, no cross-imports, stubbed event bus | backend                   |
| [0006](adr/0006-auth-secrets.md)                 | Auth, tokens, secrets, secure storage                                     | backend, mobile, security |
| [0007](adr/0007-money-movement.md)               | Money movement — double-entry ledger, `Money` VO, idempotency             | backend, data, security   |
| [0008](adr/0008-kyc.md)                          | KYC — provider adapter, status state machine, encrypted documents         | backend, mobile, security |
| [0009](adr/0009-observability-errors-testing.md) | Observability, error handling, testing                                    | backend, mobile, ops      |
| [0010](adr/0010-cicd.md)                         | CI/CD — GitHub Actions, EAS for mobile, Docker for API                    | ops                       |

## Scope (locked, 2026-05-13)

- **Platform:** mobile-first (iOS + Android via Expo). Web export retained as dev-only, dropped from CI and release.
- **Backend:** vertical slice — `identity` + `kyc` + `wallet`. Event bus stubbed (in-process + transactional outbox). 27 other domains stay running on mobile-side Zustand seeds, scheduled for follow-up.
- **Delivery:** docs + ADRs first → PRs against the [Execution Plan](execution-plan.md) → merges to `main` after this set is approved.
- **Compliance:** engineering only. Patterns are PCI-DSS-compatible (no PAN storage, tokenize through a processor SDK, audit log, secrets in env). PCI ROC, SOC2, KYC SaaS contract, banking-licence work runs in a separate track.

## What changed from the original brief

The brief was written generically and assumed a web app. The repo is a React Native app with no backend, ~30 product domains, and ~26k LOC. The mismatches and decisions made to resolve them are listed in [audit §1](audit.md#1-what-this-repo-actually-is) and [ADR-0001](adr/0001-platform-target.md). The substance of every brief requirement is honoured; the web-only metrics (Lighthouse, <200 KB gzipped, CSP, DOMPurify, etc.) are replaced with mobile-appropriate ones.

## Next step

Approve the audit + ADRs + execution plan. Then PR-0 (monorepo move) opens.
