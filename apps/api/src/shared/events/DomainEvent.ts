// A DomainEvent is a fact about a past state change. Immutable.
// Modules define concrete event types by extending this shape and
// re-exporting them from their module barrel (see ADR-0005).
export interface DomainEvent<TName extends string = string, TPayload = unknown> {
  readonly name: TName;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}
