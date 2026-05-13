# ADR-0007: Money movement — double-entry ledger, `Money` value object, idempotency

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** backend, data, security

## Context

Today the app mutates balances directly in client state ([src/store/appStore.ts:382-489](../../src/store/appStore.ts:382-489)). No ledger, no idempotency, no audit. For real money this is unacceptable on every axis.

The wallet module is the core of the slice. Correctness here is non-negotiable; everything else (KYC, auth) exists to serve it.

Audit reference: [audit §3 S0-3, S0-4](../audit.md).

## Decision

### Money value object

Floats are forbidden for money. Strings ("12.50") are ambiguous (locale, decimal separator). We use **minor units in `bigint`**:

```ts
// packages/shared-types/src/Money.ts
export type Currency = "USD" | "AED" | "CAD" | "AUD" | "EUR" | "GBP" | "SAR";

export class Money {
  private constructor(
    public readonly amount: bigint, // minor units (cents, fils, etc.)
    public readonly currency: Currency,
  ) {}

  static of(amount: bigint | number, currency: Currency): Money {
    if (typeof amount === "number") {
      if (!Number.isInteger(amount))
        throw new Error("Money.of: number must be integer minor units");
      return new Money(BigInt(amount), currency);
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    this.assertSame(other);
    return new Money(this.amount + other.amount, this.currency);
  }
  sub(other: Money): Money {
    this.assertSame(other);
    return new Money(this.amount - other.amount, this.currency);
  }
  neg(): Money {
    return new Money(-this.amount, this.currency);
  }
  isNegative(): boolean {
    return this.amount < 0n;
  }
  isZero(): boolean {
    return this.amount === 0n;
  }
  cmp(other: Money): -1 | 0 | 1 {
    this.assertSame(other);
    return this.amount === other.amount ? 0 : this.amount < other.amount ? -1 : 1;
  }

  private assertSame(other: Money) {
    if (other.currency !== this.currency)
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
  }

  toJSON() {
    return { amount: this.amount.toString(), currency: this.currency };
  }
  static fromJSON(j: { amount: string; currency: Currency }) {
    return new Money(BigInt(j.amount), j.currency);
  }
}
```

- **No division.** FX conversion is a separate operation that produces a new `Money` of a different currency via a quoted rate (see FX section below).
- Serialization: `bigint` to string in JSON to survive `JSON.stringify`. Zod schema decodes string → bigint at the boundary.
- DB column: `numeric(38, 0)` (Postgres) — exactly representable, no precision loss.

### Double-entry ledger

Every value movement is **two entries** that sum to zero, in a single `wallet.ledger_entries` row group:

```
wallet.accounts
  id            uuid pk
  owner_id      uuid              -- user (FK to identity.users by id only, no SQL FK)
  currency      text
  type          text              -- 'wallet' | 'reserve' | 'fee' | 'external_clearing'
  status        text              -- 'active' | 'frozen' | 'closed'

wallet.transactions
  id            uuid pk
  idempotency_key uuid unique not null
  type          text              -- 'transfer' | 'topup' | 'withdrawal' | 'fee' | 'reversal' | 'adjustment'
  status        text              -- 'pending' | 'posted' | 'reversed'
  created_at    timestamptz
  posted_at     timestamptz nullable
  metadata      jsonb

wallet.ledger_entries
  id            uuid pk
  transaction_id uuid references wallet.transactions(id)
  account_id    uuid references wallet.accounts(id)
  direction     text              -- 'debit' | 'credit'
  amount        numeric(38, 0)    -- positive minor units; direction carries sign
  currency      text
  created_at    timestamptz default now()

  -- Invariant enforced by trigger: SUM(CASE direction WHEN 'debit' THEN -amount ELSE amount END)
  --                                 GROUP BY transaction_id = 0
```

- A transfer from Alice's USD wallet to Bob's USD wallet is **four** ledger entries (two per side: Alice debit, fee account credit, Alice debit, Bob credit) when fees apply, or two when fees don't.
- A top-up from a processor is: external_clearing debit + user_wallet credit.
- A withdrawal is the reverse.
- **No negative balances** without an explicit `overdraft_limit` on the account (Phase 2 feature).

### Balances are derived, not stored

Wallet balance = `SUM(ledger_entries where account_id = X and posted_at IS NOT NULL)`, by currency.

For perf:

- A materialized projection (`wallet.account_balances`) is updated by the same transaction that posts ledger entries (via a trigger or a use-case-level upsert). This is the read model that the API returns.
- Reconciled nightly against the source-of-truth ledger sum; mismatches page the on-call engineer.

### Idempotency

- Every state-changing endpoint requires an `Idempotency-Key` header (UUID v4).
- Middleware (`apps/api/src/shared/middleware/idempotency.ts`) flow:
  1. Compute `idempotencyHash = sha256(method + path + userId + body)`.
  2. `SET NX` in Redis: `idem:{key}` → `{hash, status: 'in_progress'}` with 24h TTL.
  3. If key exists and `hash` matches → return cached response.
  4. If key exists and `hash` differs → 422 `Idempotency-Key-Conflict`.
  5. Process the request; cache `{hash, status: 'done', response}` on success or `{hash, status: 'failed', errorCode}` on terminal failure.
- The DB layer **also** stores the idempotency key on `wallet.transactions` with a unique constraint — Redis is the fast path; the DB is the truth. A failure between Redis-set and DB-write is recovered on retry (the unique constraint blocks the duplicate insert).

### Transaction lifecycle

```
created (idempotency record + metadata)
   ↓
posted (ledger entries written + projection updated, in single $transaction)
   ↓
[optional] reversed (compensating ledger entries; original entries unchanged)
```

- Two-phase posting (`pending` → `posted`) is used when the operation depends on an external call (e.g. processor authorisation). Until `posted`, the user's available balance shows the **uncleared** balance via the `reserve` account pattern.
- Reversal **never deletes** original entries. The audit trail is append-only.

### FX

- FX rates are quoted by a `FxRateProvider` port (Phase 1 stub returns fixed rates; Phase 2 plugs in an aggregator).
- Conversion is a separate transaction with two distinct currencies: source debit + fx_clearing credit + fx_clearing debit + dest credit. The fx_clearing account holds the spread.
- Rates are quoted with a TTL; a conversion uses the rate active at the quote time and stores the rate id with the transaction.

### Concurrency

- Per-account row-lock (`SELECT ... FOR UPDATE`) inside the `$transaction`. We will measure contention; if a single account becomes a hot spot (e.g. a merchant's payout account), introduce account-sharding (multiple ledger rows aggregated; balance is the sum). This is a Phase 2 concern.

### Currency precision per code

```
USD, AED, CAD, AUD, EUR, GBP, SAR → 2 minor units (cents/fils)
KWD, BHD, OMR, JOD                → 3 minor units (overrides table at startup)
JPY                               → 0 minor units
```

A small `currencies.json` configures these; `Money` rejects construction for unknown currencies.

### Endpoints (Phase 1)

| Method | Path                               | Body                                                     | Auth        | Idempotency |
| ------ | ---------------------------------- | -------------------------------------------------------- | ----------- | ----------- |
| GET    | `/v1/wallet/accounts`              | —                                                        | yes         | —           |
| GET    | `/v1/wallet/accounts/:id/balance`  | —                                                        | yes         | —           |
| GET    | `/v1/wallet/transactions`          | filters                                                  | yes         | —           |
| POST   | `/v1/wallet/transfers`             | `{ fromAccountId, toAccountId, amount, currency, note }` | yes         | required    |
| POST   | `/v1/wallet/topups`                | `{ accountId, amount, currency, source }`                | yes         | required    |
| POST   | `/v1/wallet/withdrawals`           | `{ accountId, amount, currency, destination }`           | yes         | required    |
| POST   | `/v1/wallet/transfers/:id/reverse` | `{ reason }`                                             | yes + admin | required    |

All bodies validated by Zod schemas in `packages/shared-validation`.

### Testing

- **Property-based** tests on the ledger using `fast-check`:
  - For any sequence of valid transfers between accounts, the sum of all ledger entries is zero per transaction.
  - For any sequence, the projection equals the sum query.
  - For any concurrent transfer pair, no negative balance occurs (modulo overdraft).
- Postgres integration tests via Testcontainers — never mocked at this layer.

## Consequences

**Positive**

- Money correctness is a structural property of the schema + the value object, not a runtime check.
- Reversals are auditable.
- Concurrency is bounded and observable.
- Extraction to a `wallet` microservice is trivial: it owns its schema and exposes events.

**Negative**

- Boilerplate per movement type (every action requires entries, projection, events).
- Property-based tests are slow; we run a small sample on PR CI and a large sample on the nightly job.

**Neutral / accept**

- Materialized projection means there's a window (microseconds inside a transaction) where the projection lags the ledger. Inside the transaction this is fine; outside, the only consumer that reads projection is the API, which always reads inside a fresh query.

## Alternatives considered

1. **Single-entry "balance update" approach** (mutate `accounts.balance` directly). The model in the demo today. Loses the audit trail; impossible to reconcile; impossible to reverse correctly. Rejected.
2. **Event-sourcing the wallet.** True append-only event log + projection. Cleaner theoretically; far more operational complexity (snapshotting, replay, schema evolution of events). The double-entry ledger gives us 80% of the same correctness benefits at 20% of the operational cost. Revisit if we need to provide arbitrary historical projections at runtime.
3. **Numeric instead of bigint.** Postgres `numeric` is fine for storage; in JS we need a single representation. JS `Number` loses precision past 2^53. We pick `bigint` to be unambiguous everywhere.

## Rollout

- PR-5: `wallet` module skeleton + `Money` value object + Prisma schema for `wallet.*` + idempotency middleware.
- PR-6: `POST /v1/wallet/transfers` end-to-end (domain + use case + repo + route + tests).
- PR-7: top-up + withdrawal endpoints (calling a stub `PaymentProcessor` port).
- PR-8: mobile wallet feature migration (send / receive / home balance / transactions list) wired to the new endpoints.

## Revisit when

- A single account hits write contention (Phase 2 if/when merchants land on the platform).
- We add a second sub-ledger (e.g. crypto custody) — confirm the same patterns hold or introduce a separate accounting unit.
- Regulatory reporting requires categorised reserves (e.g. "safeguarded funds" under FCA) — extend `accounts.type`.
