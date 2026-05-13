import type { Result } from "@zadpay/errors";
import type { Money } from "@zadpay/types";
import type { Transaction } from "../entities/Transaction.js";
import type { InsufficientBalance } from "../errors/index.js";

// Atomic ledger write for movements that cross the user/system boundary:
//   topup     → debit external_clearing, credit user_wallet
//   withdrawal → debit user_wallet,      credit external_clearing
// The system-side `external_clearing` account is created lazily on first
// use, per currency. PR-future adds reconciliation against the processor's
// settlement reports.
export interface PostExternalMovementInput {
  transactionId: string;
  idempotencyKey: string;
  userAccountId: string;
  amount: Money;
  type: "topup" | "withdrawal";
  providerRef: string;
  metadata: Readonly<Record<string, unknown>>;
  now: Date;
}

export interface ExternalClearingWriter {
  postExternalMovement(
    input: PostExternalMovementInput,
  ): Promise<Result<Transaction, InsufficientBalance>>;
}
