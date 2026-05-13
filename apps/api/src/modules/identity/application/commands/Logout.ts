import { ok, type Result } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import type { UserLoggedOut } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { RefreshTokenHasher } from "../../domain/ports/RefreshTokenHasher.js";
import type { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository.js";

export interface LogoutInput {
  refreshToken: string;
}

export interface LogoutDeps {
  refreshTokens: RefreshTokenRepository;
  refreshHasher: RefreshTokenHasher;
  clock: Clock;
  events: EventBus;
}

// Logout revokes the whole family — "log out everywhere with this lineage."
// Idempotent: an unknown/expired token returns success silently so the
// client doesn't have to special-case retry storms.
export class LogoutCommand {
  constructor(private readonly deps: LogoutDeps) {}

  async execute(input: LogoutInput): Promise<Result<void, never>> {
    const hash = this.deps.refreshHasher.hash(input.refreshToken);
    const stored = await this.deps.refreshTokens.findByTokenHash(hash);
    if (stored === null) return ok(undefined);

    await this.deps.refreshTokens.revokeFamily(stored.family);
    const evt: UserLoggedOut = {
      name: "identity.UserLoggedOut",
      aggregateId: stored.userId,
      occurredAt: this.deps.clock.now(),
      payload: { userId: stored.userId },
    };
    await this.deps.events.publish(evt);
    return ok(undefined);
  }
}
