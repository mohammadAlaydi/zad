import type { DomainEvent } from "../../../../shared/events/DomainEvent.js";

// Public events of the wallet module. PR-10 adds Transfer*; PR-11 adds
// Topup* / Withdrawal*. PR-9 (read-only) emits only account lifecycle
// events.

export type WalletAccountOpened = DomainEvent<
  "wallet.AccountOpened",
  { accountId: string; ownerId: string; currency: string; type: string }
>;
