import { ok, type Result, err } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { RefreshToken } from "../../domain/entities/RefreshToken.js";
import { RefreshTokenInvalid, RefreshTokenReplay } from "../../domain/errors/index.js";
import type { RefreshTokenReplayed, RefreshTokenRotated } from "../../domain/events/index.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import { type IssueTokensDeps, type IssueTokensResult } from "./shared/issueTokens.js";

export interface RefreshInput {
  refreshToken: string;
}

export interface RefreshDeps extends IssueTokensDeps {
  users: UserRepository;
  events: EventBus;
}

// One-time-use refresh tokens with rotation + family revocation per ADR-0006.
//   • Valid token → rotate: revoke old + issue new in same family.
//   • Expired/unknown token → 401 (RefreshTokenInvalid).
//   • Already-rotated token presented again → REPLAY:
//       revoke entire family + fire RefreshTokenReplayed event + 401.
export class RefreshCommand {
  constructor(private readonly deps: RefreshDeps) {}

  async execute(
    input: RefreshInput,
  ): Promise<Result<IssueTokensResult, RefreshTokenInvalid | RefreshTokenReplay>> {
    const incomingHash = this.deps.refreshHasher.hash(input.refreshToken);
    const stored = await this.deps.refreshTokens.findByTokenHash(incomingHash);
    if (stored === null) return err(new RefreshTokenInvalid());

    const now = this.deps.clock.now();
    if (stored.isExpired(now)) return err(new RefreshTokenInvalid());

    if (stored.isReplay()) {
      await this.deps.refreshTokens.revokeFamily(stored.family);
      const evt: RefreshTokenReplayed = {
        name: "identity.RefreshTokenReplayed",
        aggregateId: stored.userId,
        occurredAt: now,
        payload: { userId: stored.userId, family: stored.family },
      };
      await this.deps.events.publish(evt);
      return err(new RefreshTokenReplay());
    }

    if (stored.isRevoked()) {
      // Revoked but not rotated — could be an explicit logout in flight.
      return err(new RefreshTokenInvalid());
    }

    const user = await this.deps.users.findById(stored.userId);
    if (user === null) return err(new RefreshTokenInvalid());

    // Issue the new token first so we know its id, then rotate atomically.
    const newPlaintext = this.deps.refreshHasher.generate();
    const newHash = this.deps.refreshHasher.hash(newPlaintext);
    const newId = this.deps.ids.uuid();
    const newExpiresAt = new Date(now.getTime() + this.deps.refreshTokenTtlSeconds * 1000);
    const newToken = RefreshToken.create({
      id: newId,
      userId: stored.userId,
      family: stored.family,
      tokenHash: newHash,
      expiresAt: newExpiresAt,
      now,
    });
    await this.deps.refreshTokens.rotate(stored.id, newToken);

    const access = await this.deps.tokenSigner.signAccess({
      sub: user.id,
      kyc: user.kycStatus,
      roles: user.roles,
    });

    const rotated: RefreshTokenRotated = {
      name: "identity.RefreshTokenRotated",
      aggregateId: user.id,
      occurredAt: now,
      payload: { userId: user.id, family: stored.family },
    };
    await this.deps.events.publish(rotated);

    return ok({
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      refreshToken: newPlaintext,
      refreshTokenExpiresAt: newExpiresAt,
      user,
    });
  }
}
