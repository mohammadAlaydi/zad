import type { Order } from "../entities/Order.js";

export interface OrderRepository {
  findByIdempotencyKey(key: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
}
