// Order aggregate. Snapshots the cart at checkout time and links to the
// wallet transaction once payment posts. Lives in checkout.orders; the
// customer / merchant references to identity.users are soft (no FK)
// per ADR-0005.

import type { Currency } from "@zadpay/types";

export interface OrderItem {
  readonly id: string;
  readonly name: string;
  readonly priceMinor: bigint;
  readonly quantity: number;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export class Order {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly merchantId: string,
    public readonly merchantName: string,
    public readonly items: readonly OrderItem[],
    public readonly totalMinor: bigint,
    public readonly currency: Currency,
    public readonly status: OrderStatus,
    public readonly transactionId: string | null,
    public readonly failureReason: string | null,
    public readonly idempotencyKey: string,
    public readonly createdAt: Date,
    public readonly paidAt: Date | null,
  ) {}

  static create(props: {
    id: string;
    customerId: string;
    merchantId: string;
    merchantName: string;
    items: readonly OrderItem[];
    totalMinor: bigint;
    currency: Currency;
    idempotencyKey: string;
    now: Date;
  }): Order {
    return new Order(
      props.id,
      props.customerId,
      props.merchantId,
      props.merchantName,
      props.items,
      props.totalMinor,
      props.currency,
      "pending",
      null,
      null,
      props.idempotencyKey,
      props.now,
      null,
    );
  }

  static rehydrate(props: {
    id: string;
    customerId: string;
    merchantId: string;
    merchantName: string;
    items: readonly OrderItem[];
    totalMinor: bigint;
    currency: Currency;
    status: OrderStatus;
    transactionId: string | null;
    failureReason: string | null;
    idempotencyKey: string;
    createdAt: Date;
    paidAt: Date | null;
  }): Order {
    return new Order(
      props.id,
      props.customerId,
      props.merchantId,
      props.merchantName,
      props.items,
      props.totalMinor,
      props.currency,
      props.status,
      props.transactionId,
      props.failureReason,
      props.idempotencyKey,
      props.createdAt,
      props.paidAt,
    );
  }

  markPaid(transactionId: string, now: Date): Order {
    return new Order(
      this.id,
      this.customerId,
      this.merchantId,
      this.merchantName,
      this.items,
      this.totalMinor,
      this.currency,
      "paid",
      transactionId,
      null,
      this.idempotencyKey,
      this.createdAt,
      now,
    );
  }

  markFailed(reason: string): Order {
    return new Order(
      this.id,
      this.customerId,
      this.merchantId,
      this.merchantName,
      this.items,
      this.totalMinor,
      this.currency,
      "failed",
      this.transactionId,
      reason,
      this.idempotencyKey,
      this.createdAt,
      this.paidAt,
    );
  }
}
