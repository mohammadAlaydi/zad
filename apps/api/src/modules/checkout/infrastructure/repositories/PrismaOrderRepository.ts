import type { Order as PrismaOrder, PrismaClient } from "@prisma/client";
import { isCurrency, type Currency } from "@zadpay/types";
import { Order, type OrderItem, type OrderStatus } from "../../domain/entities/Order.js";
import type { OrderRepository } from "../../domain/ports/OrderRepository.js";

function isStatus(s: string): s is OrderStatus {
  return s === "pending" || s === "paid" || s === "failed" || s === "cancelled";
}

function parseItems(raw: unknown): readonly OrderItem[] {
  if (!Array.isArray(raw)) return [];
  const out: OrderItem[] = [];
  for (const it of raw) {
    if (typeof it !== "object" || it === null) continue;
    const obj = it as Record<string, unknown>;
    const id = typeof obj.id === "string" ? obj.id : null;
    const name = typeof obj.name === "string" ? obj.name : null;
    const priceMinor =
      typeof obj.priceMinor === "string" || typeof obj.priceMinor === "number"
        ? BigInt(obj.priceMinor)
        : null;
    const quantity = typeof obj.quantity === "number" ? Math.trunc(obj.quantity) : null;
    if (id === null || name === null || priceMinor === null || quantity === null) continue;
    out.push({ id, name, priceMinor, quantity });
  }
  return out;
}

function toDomain(row: PrismaOrder): Order {
  const currency: Currency = isCurrency(row.currency) ? row.currency : "USD";
  const status: OrderStatus = isStatus(row.status) ? row.status : "pending";
  return Order.rehydrate({
    id: row.id,
    customerId: row.customerId,
    merchantId: row.merchantId,
    merchantName: row.merchantName,
    items: parseItems(row.items),
    totalMinor: row.totalMinor,
    currency,
    status,
    transactionId: row.transactionId,
    failureReason: row.failureReason,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
  });
}

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { idempotencyKey: key } });
    return row === null ? null : toDomain(row);
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        merchantId: order.merchantId,
        merchantName: order.merchantName,
        items: order.items.map((i) => ({
          id: i.id,
          name: i.name,
          priceMinor: i.priceMinor.toString(),
          quantity: i.quantity,
        })),
        totalMinor: order.totalMinor,
        currency: order.currency,
        status: order.status,
        transactionId: order.transactionId,
        failureReason: order.failureReason,
        idempotencyKey: order.idempotencyKey,
        paidAt: order.paidAt,
      },
    });
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        transactionId: order.transactionId,
        failureReason: order.failureReason,
        paidAt: order.paidAt,
      },
    });
  }
}
