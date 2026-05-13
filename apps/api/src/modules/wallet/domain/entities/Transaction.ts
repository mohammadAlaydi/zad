import type { TransactionStatus, TransactionType } from "../value-objects/TransactionType.js";
import type { LedgerEntry } from "./LedgerEntry.js";

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly idempotencyKey: string,
    public readonly type: TransactionType,
    public readonly status: TransactionStatus,
    public readonly createdAt: Date,
    public readonly postedAt: Date | null,
    public readonly metadata: Readonly<Record<string, unknown>>,
    public readonly entries: readonly LedgerEntry[],
  ) {}
}
