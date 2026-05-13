import type { Currency, Money } from "@zadpay/types";
import type { LedgerDirection } from "../value-objects/TransactionType.js";

// One row of a transaction's accounting. `amount` is always positive
// minor units; `direction` carries the sign. Per ADR-0007, summing
// signed amounts across a transaction must yield zero.
export class LedgerEntry {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly accountId: string,
    public readonly direction: LedgerDirection,
    public readonly amount: bigint,
    public readonly currency: Currency,
    public readonly createdAt: Date,
  ) {}

  /// Signed minor units: debit → -amount, credit → +amount.
  signedAmount(): bigint {
    return this.direction === "debit" ? -this.amount : this.amount;
  }

  static debit(props: {
    id: string;
    transactionId: string;
    accountId: string;
    money: Money;
    now: Date;
  }): LedgerEntry {
    return new LedgerEntry(
      props.id,
      props.transactionId,
      props.accountId,
      "debit",
      props.money.amount < 0n ? -props.money.amount : props.money.amount,
      props.money.currency,
      props.now,
    );
  }

  static credit(props: {
    id: string;
    transactionId: string;
    accountId: string;
    money: Money;
    now: Date;
  }): LedgerEntry {
    return new LedgerEntry(
      props.id,
      props.transactionId,
      props.accountId,
      "credit",
      props.money.amount < 0n ? -props.money.amount : props.money.amount,
      props.money.currency,
      props.now,
    );
  }
}
