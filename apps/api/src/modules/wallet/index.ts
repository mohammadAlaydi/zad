// Public surface of the wallet module. Other modules subscribe to these
// events (risk on every posted transaction, notifications on balance
// changes). Internal layers stay private (ESLint enforces it).

export type { WalletAccountOpened } from "./domain/events/index.js";
// PR-10 will add TransferCreated / TransferPosted / TransferFailed.
// PR-11 will add Topup* / Withdrawal*.

export { registerWalletModule } from "./register.js";
export type { WalletModuleConfig } from "./register.js";
