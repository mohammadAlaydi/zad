import { err, ok, type Result } from "@zadpay/errors";
import type { Currency } from "@zadpay/types";
import { Order, type OrderItem } from "../../domain/entities/Order.js";
import {
  CheckoutTransferFailed,
  MerchantNotFound,
  TotalMismatch,
} from "../../domain/errors/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { MerchantDirectory } from "../../domain/ports/MerchantDirectory.js";
import type { OrderRepository } from "../../domain/ports/OrderRepository.js";
import type { WalletTransferGateway } from "../../domain/ports/WalletTransferGateway.js";

export interface PayCheckoutInput {
  customerId: string;
  merchantPhone: string;
  items: readonly OrderItem[];
  totalMinor: bigint;
  currency: Currency;
  idempotencyKey: string;
}

export interface PayCheckoutOutput {
  orderId: string;
  status: "paid";
  transactionId: string;
  merchantName: string;
}

export type PayCheckoutError = MerchantNotFound | CheckoutTransferFailed | TotalMismatch;

export interface PayCheckoutDeps {
  orders: OrderRepository;
  merchants: MerchantDirectory;
  wallet: WalletTransferGateway;
  ids: IdGenerator;
  clock: Clock;
}

// Single-step checkout: validate, create order (pending), call wallet
// transfer, mark order paid. Idempotent on `idempotencyKey` — replaying
// the same key returns the original order without re-charging.
export class PayCheckoutCommand {
  constructor(private readonly deps: PayCheckoutDeps) {}

  async execute(input: PayCheckoutInput): Promise<Result<PayCheckoutOutput, PayCheckoutError>> {
    // Idempotency short-circuit: same key → return existing result.
    const existing = await this.deps.orders.findByIdempotencyKey(input.idempotencyKey);
    if (existing !== null) {
      if (existing.status === "paid" && existing.transactionId !== null) {
        return ok({
          orderId: existing.id,
          status: "paid",
          transactionId: existing.transactionId,
          merchantName: existing.merchantName,
        });
      }
      // A previous attempt failed; treat the key as exhausted and
      // surface the same failure so callers can ask the user to retry
      // with a fresh idempotency key.
      if (existing.status === "failed") {
        return err(new CheckoutTransferFailed(existing.failureReason ?? "Previous attempt failed"));
      }
      // Pending: rare unless a previous request crashed mid-flight.
      // Treat as a retry by falling through to a fresh transfer attempt;
      // the wallet's own idempotency dedup will absorb the duplicate.
    }

    // Validate items add up to the declared total.
    const computed = input.items.reduce(
      (acc, item) => acc + item.priceMinor * BigInt(item.quantity),
      0n,
    );
    if (computed !== input.totalMinor) {
      return err(new TotalMismatch());
    }

    const merchant = await this.deps.merchants.byPhone(input.merchantPhone);
    if (merchant === null || merchant.userId === input.customerId) {
      return err(new MerchantNotFound());
    }

    const now = this.deps.clock.now();
    const order =
      existing ??
      Order.create({
        id: this.deps.ids.uuid(),
        customerId: input.customerId,
        merchantId: merchant.userId,
        merchantName: merchant.fullName ?? "ZADPAY merchant",
        items: input.items,
        totalMinor: input.totalMinor,
        currency: input.currency,
        idempotencyKey: input.idempotencyKey,
        now,
      });
    if (existing === null) {
      await this.deps.orders.save(order);
    }

    const transfer = await this.deps.wallet.transfer({
      senderUserId: input.customerId,
      recipientUserId: merchant.userId,
      amountMinor: input.totalMinor,
      currency: input.currency,
      // Order id is a stable derivation of the checkout idempotency key
      // — reusing it as the wallet idempotency key means a retry of the
      // same checkout dedupes at the ledger too.
      idempotencyKey: order.id,
      note: `Checkout ${order.id.slice(0, 8)}`,
    });
    if (!transfer.ok) {
      const failed = order.markFailed(`${transfer.code}: ${transfer.message}`);
      await this.deps.orders.update(failed);
      return err(new CheckoutTransferFailed(transfer.message));
    }

    const paid = order.markPaid(transfer.transactionId, this.deps.clock.now());
    await this.deps.orders.update(paid);

    return ok({
      orderId: paid.id,
      status: "paid",
      transactionId: transfer.transactionId,
      merchantName: paid.merchantName,
    });
  }
}
