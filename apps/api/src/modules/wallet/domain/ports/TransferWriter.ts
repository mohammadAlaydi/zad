import type { Result } from "@zadpay/errors";
import type { Money } from "@zadpay/types";
import type { Transaction } from "../entities/Transaction.js";
import type { InsufficientBalance } from "../errors/index.js";

export interface PostTransferInput {
  transactionId: string;
  idempotencyKey: string;
  sourceAccountId: string;
  destAccountId: string;
  amount: Money;
  metadata: Readonly<Record<string, unknown>>;
  now: Date;
}

// Atomically: lock both accounts FOR UPDATE, re-check balance (race-safe),
// insert transaction header, insert two ledger entries, update both
// balance projections. The Postgres trigger from
// prisma/sql/enforce_ledger_balance.sql guarantees the entries sum to zero.
//
// Use-case-level pre-checks (ownership, currency match, same-account)
// happen BEFORE this is called; the writer is only responsible for the
// race-safe "commit it" step plus its own balance check.
export interface TransferWriter {
  postTransfer(input: PostTransferInput): Promise<Result<Transaction, InsufficientBalance>>;
}
