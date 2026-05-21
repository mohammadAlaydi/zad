// Port the checkout module uses to move money between two users. The
// composition root wires this to wallet.transferBetweenUsers — checkout
// never imports wallet directly.

import type { Currency } from "@zadpay/types";

export interface WalletTransferInput {
  senderUserId: string;
  recipientUserId: string;
  amountMinor: bigint;
  currency: Currency;
  idempotencyKey: string;
  note?: string;
}

export type WalletTransferResult =
  | { ok: true; transactionId: string }
  | { ok: false; code: string; message: string };

export interface WalletTransferGateway {
  transfer(input: WalletTransferInput): Promise<WalletTransferResult>;
}
