import type { DomainEvent } from "../../../../shared/events/DomainEvent.js";

// Public events emitted by the identity module. Other modules (risk, audit,
// notifications) subscribe to these via the EventBus. Per ADR-0005 these
// are the ONLY symbols other modules may import from `identity`.

export type UserRegistered = DomainEvent<
  "identity.UserRegistered",
  { userId: string; email: string | null }
>;

export type LoginSucceeded = DomainEvent<
  "identity.LoginSucceeded",
  { userId: string; ip?: string; userAgent?: string }
>;

export type LoginFailed = DomainEvent<
  "identity.LoginFailed",
  { email: string; reason: string; ip?: string }
>;

export type RefreshTokenRotated = DomainEvent<
  "identity.RefreshTokenRotated",
  { userId: string; family: string }
>;

// Replay detection fires this — risk module listens to lock accounts, alert, etc.
export type RefreshTokenReplayed = DomainEvent<
  "identity.RefreshTokenReplayed",
  { userId: string; family: string }
>;

export type UserLoggedOut = DomainEvent<"identity.UserLoggedOut", { userId: string }>;
