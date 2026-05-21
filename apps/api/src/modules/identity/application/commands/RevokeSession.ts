import { err, ok, type Result } from "@zadpay/errors";
import { SessionNotFound } from "../../domain/errors/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository.js";

export interface RevokeSessionInput {
  userId: string;
  sessionId: string;
}

export interface RevokeSessionDeps {
  refreshTokens: RefreshTokenRepository;
  clock: Clock;
}

// Revokes a single refresh token. The userId scope on the repo update
// prevents a leaked session id from being used to revoke someone else's
// device.
export class RevokeSessionCommand {
  constructor(private readonly deps: RevokeSessionDeps) {}

  async execute(input: RevokeSessionInput): Promise<Result<void, SessionNotFound>> {
    const found = await this.deps.refreshTokens.revokeById(
      input.sessionId,
      input.userId,
      this.deps.clock.now(),
    );
    if (!found) return err(new SessionNotFound());
    return ok(undefined);
  }
}

export interface RevokeAllSessionsInput {
  userId: string;
}

// Lost-device lock: revoke every active refresh token for the caller.
// The caller's own session is included so they'll be signed out as well
// — that's intentional (re-login required everywhere).
export class RevokeAllSessionsCommand {
  constructor(private readonly deps: RevokeSessionDeps) {}

  async execute(input: RevokeAllSessionsInput): Promise<Result<{ revoked: number }, never>> {
    const count = await this.deps.refreshTokens.revokeAllForUser(
      input.userId,
      this.deps.clock.now(),
    );
    return ok({ revoked: count });
  }
}
