// Public surface of the wallet module. Other modules subscribe to these
// events (risk on every posted transaction, notifications on balance
// changes). Internal layers stay private (ESLint enforces it).

export type {
  TransferCreated,
  TransferFailed,
  TransferPosted,
  WalletAccountOpened,
} from "./domain/events/index.js";
// PR-11 added Topup* / Withdrawal* in the domain; consumers will be wired
// here when they have subscribers.

export { registerWalletModule } from "./register.js";
export type { WalletModuleConfig, WalletModuleHandles } from "./register.js";
