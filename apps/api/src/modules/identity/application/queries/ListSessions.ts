import { ok, type Result } from "@zadpay/errors";
import type { Clock } from "../../domain/ports/Clock.js";
import type { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository.js";

export interface SessionView {
  id: string;
  family: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ListSessionsInput {
  userId: string;
}

export interface ListSessionsDeps {
  refreshTokens: RefreshTokenRepository;
  clock: Clock;
}

// Lists active sessions (= active refresh tokens). Each row represents a
// logged-in device. Rotated tokens are filtered out so we don't show
// duplicates after a normal access-token refresh.
export class ListSessionsQuery {
  constructor(private readonly deps: ListSessionsDeps) {}

  async execute(input: ListSessionsInput): Promise<Result<readonly SessionView[], never>> {
    const tokens = await this.deps.refreshTokens.findActiveByUser(
      input.userId,
      this.deps.clock.now(),
    );
    return ok(
      tokens.map((t) => ({
        id: t.id,
        family: t.family,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
      })),
    );
  }
}
