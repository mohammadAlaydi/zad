import type { DomainEvent } from "./DomainEvent.js";

export type EventHandler<E extends DomainEvent> = (event: E) => Promise<void>;

// The single cross-module communication channel. Modules MUST NOT call into
// each other directly — they publish events and subscribe to them.
// Phase 1: in-process (InProcessEventBus).
// Future: Kafka / RabbitMQ / NATS — same interface, different transport.
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<E extends DomainEvent>(name: E["name"], handler: EventHandler<E>): void;
}
