import { logger } from "../../infra/logger/index.js";
import type { DomainEvent } from "./DomainEvent.js";
import type { EventBus, EventHandler } from "./EventBus.js";

// In-memory bus. Handlers run sequentially per event but events themselves
// are pumped concurrently. A failing handler is logged and does NOT block
// the others — at-most-once semantics in-process; durability is provided
// by the outbox table.
export class InProcessEventBus implements EventBus {
  private readonly handlers = new Map<string, Array<EventHandler<DomainEvent>>>();

  async publish(event: DomainEvent): Promise<void> {
    const subscribers = this.handlers.get(event.name) ?? [];
    await Promise.all(
      subscribers.map((handler) =>
        handler(event).catch((err: unknown) => {
          logger.error(
            { err, event: { name: event.name, id: event.aggregateId } },
            "Event handler failed",
          );
        }),
      ),
    );
  }

  subscribe<E extends DomainEvent>(name: E["name"], handler: EventHandler<E>): void {
    const list = this.handlers.get(name) ?? [];
    list.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(name, list);
  }
}
