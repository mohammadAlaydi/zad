import type { DomainEvent } from "../../../../shared/events/DomainEvent.js";

// Public events of the wallet module. PR-10 adds Transfer*; PR-11 adds
// Topup* / Withdrawal*. PR-9 (read-only) emits only account lifecycle
// events.

export type WalletAccountOpened = DomainEvent<
  "wallet.AccountOpened",
  { accountId: string; ownerId: string; currency: string; type: string }
>;

export type TransferCreated = DomainEvent<
  "wallet.TransferCreated",
  {
    transactionId: string;
    sourceAccountId: string;
    destAccountId: string;
    amount: string; // bigint as string
    currency: string;
  }
>;

export type TransferPosted = DomainEvent<
  "wallet.TransferPosted",
  {
    transactionId: string;
    sourceAccountId: string;
    destAccountId: string;
    amount: string;
    currency: string;
  }
>;

export type TransferFailed = DomainEvent<
  "wallet.TransferFailed",
  {
    sourceAccountId: string;
    destAccountId: string;
    amount: string;
    currency: string;
    reason: string;
  }
>;
