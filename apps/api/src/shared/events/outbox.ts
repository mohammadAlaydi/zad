// Transactional outbox per ADR-0005. Writers append rows to
// shared.event_outbox in the same DB transaction as the state change.
// A background dispatcher reads unpublished rows and forwards them to the
// EventBus. When we extract modules to services, the dispatcher becomes a
// Kafka/RabbitMQ producer and this same table is the source of truth.

import type { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "../../infra/logger/index.js";
import type { DomainEvent } from "./DomainEvent.js";
import type { EventBus } from "./EventBus.js";

export type OutboxWriter = (event: DomainEvent, tx?: Prisma.TransactionClient) => Promise<void>;

// Returns a writer bound to the given Prisma client. Callers pass a `tx`
// argument when inside `prisma.$transaction(...)` so the outbox insert is
// part of the same transaction as the state change.
export function createOutboxWriter(prisma: PrismaClient): OutboxWriter {
  return async (event, tx) => {
    const client = tx ?? prisma;
    await client.eventOutbox.create({
      data: {
        aggregateId: event.aggregateId,
        eventName: event.name,
        payload: event.payload as Prisma.InputJsonValue,
      },
    });
  };
}

export interface OutboxDispatcher {
  stop: () => void;
}

// Polls shared.event_outbox for unpublished rows and forwards them to
// the bus. At-least-once: a row may be republished if the process crashes
// between bus.publish() and the `publishedAt` update — subscribers must be
// idempotent on event ID. (Phase-2 hardening: row-level locking via
// SELECT ... FOR UPDATE SKIP LOCKED for multi-instance dispatchers.)
export function startOutboxDispatcher(
  prisma: PrismaClient,
  bus: EventBus,
  opts: { batchSize?: number; intervalMs?: number } = {},
): OutboxDispatcher {
  const batchSize = opts.batchSize ?? 100;
  const intervalMs = opts.intervalMs ?? 1000;
  let stopped = false;

  async function tick(): Promise<void> {
    if (stopped) return;
    try {
      const rows = await prisma.eventOutbox.findMany({
        where: { publishedAt: null },
        take: batchSize,
        orderBy: { createdAt: "asc" },
      });
      for (const row of rows) {
        await bus.publish({
          name: row.eventName,
          aggregateId: row.aggregateId,
          occurredAt: row.createdAt,
          payload: row.payload,
        });
        await prisma.eventOutbox.update({
          where: { id: row.id },
          data: { publishedAt: new Date() },
        });
      }
    } catch (err) {
      logger.error({ err }, "Outbox dispatcher tick failed");
    }
    if (!stopped) {
      setTimeout(() => void tick(), intervalMs).unref();
    }
  }

  setTimeout(() => void tick(), intervalMs).unref();
  return {
    stop: () => {
      stopped = true;
    },
  };
}
