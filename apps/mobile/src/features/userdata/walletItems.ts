// Helpers for features whose items need to coordinate with the wallet
// (savings, goals, bnpl, vouchers when paid, stocks, crypto). The pattern
// is: spend from wallet → record/update item on the backend.

import type { Currency } from "@zadpay/types";
import { dollarsToMinor, refundToWallet, spendFromWallet } from "@/features/wallet/spend";
import { newIdempotencyKey } from "@/lib/api/idempotency";
import { userdataService } from "./service";

interface WalletMoveOpts {
  accountId: string;
  currency: Currency;
  amountUsd: number;
  feature: string;
  ref: string;
}

export async function spendThenUpdateItem(
  itemFeature: string,
  itemId: string,
  newPayload: Record<string, unknown>,
  wallet: WalletMoveOpts,
): Promise<void> {
  await spendFromWallet({
    accountId: wallet.accountId,
    amountMinor: dollarsToMinor(wallet.amountUsd),
    currency: wallet.currency,
    feature: wallet.feature,
    ref: wallet.ref,
    idempotencyKey: newIdempotencyKey(),
  });
  const r = await userdataService.update(itemFeature, itemId, newPayload);
  if (!r.ok) throw r.error;
}

export async function refundThenUpdateItem(
  itemFeature: string,
  itemId: string,
  newPayload: Record<string, unknown>,
  wallet: WalletMoveOpts,
): Promise<void> {
  await refundToWallet({
    accountId: wallet.accountId,
    amountMinor: dollarsToMinor(wallet.amountUsd),
    currency: wallet.currency,
    feature: wallet.feature,
    ref: wallet.ref,
    idempotencyKey: newIdempotencyKey(),
  });
  const r = await userdataService.update(itemFeature, itemId, newPayload);
  if (!r.ok) throw r.error;
}

export async function spendThenCreateItem(
  itemFeature: string,
  payload: Record<string, unknown>,
  wallet: WalletMoveOpts,
): Promise<{ id: string }> {
  await spendFromWallet({
    accountId: wallet.accountId,
    amountMinor: dollarsToMinor(wallet.amountUsd),
    currency: wallet.currency,
    feature: wallet.feature,
    ref: wallet.ref,
    idempotencyKey: newIdempotencyKey(),
  });
  const r = await userdataService.create(itemFeature, payload);
  if (!r.ok) throw r.error;
  return { id: r.value.id };
}
