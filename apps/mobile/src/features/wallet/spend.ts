// Helpers that move money in/out of the user's wallet for any feature
// that doesn't have its own dedicated endpoint. Withdrawals = "spend"
// (e.g., contribute to savings, pay BNPL installment, buy stock). Topups
// = "refund/credit" (e.g., withdraw from savings, sell stock).
//
// Both stamp `destination` / `source` with a `feature:identifier` marker
// so the wallet ledger reflects which feature moved the money. Callers
// generate one idempotency key per logical attempt; React Query +
// `useMutation` callers can pass `Crypto.randomUUID()` per click.

import type { Currency } from "@zadpay/types";
import { walletService } from "./services/walletService";

interface MoveArgs {
  accountId: string;
  amountMinor: bigint;
  currency: Currency;
  feature: string;
  /** Free-form correlator (savings plan id, goal id, stock ticker, etc.) */
  ref: string;
  idempotencyKey: string;
}

/// Debits the wallet (money leaves). Returns the transaction on success.
export async function spendFromWallet(args: MoveArgs) {
  const result = await walletService.withdraw(
    {
      accountId: args.accountId,
      amount: { amount: args.amountMinor.toString(), currency: args.currency },
      destination: `${args.feature}:${args.ref}`,
    },
    args.idempotencyKey,
  );
  if (!result.ok) throw result.error;
  return result.value;
}

/// Credits the wallet (money comes back). Returns the transaction on success.
export async function refundToWallet(args: MoveArgs) {
  const result = await walletService.topup(
    {
      accountId: args.accountId,
      amount: { amount: args.amountMinor.toString(), currency: args.currency },
      source: `${args.feature}:${args.ref}`,
    },
    args.idempotencyKey,
  );
  if (!result.ok) throw result.error;
  return result.value;
}

/// Convert major-unit dollars (e.g. 12.5) to minor units bigint (1250).
/// Rounds half-up because that's what every consumer-facing flow expects.
export function dollarsToMinor(major: number): bigint {
  return BigInt(Math.round(major * 100));
}
