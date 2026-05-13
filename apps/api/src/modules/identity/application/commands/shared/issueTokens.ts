// Shared token-issuance helper. Used by Login, Register, and Refresh to
// produce a fresh access+refresh pair for a given user. Keeping it in one
// place ensures the three flows can't drift on expiry math, family id
// handling, or claim shape.

import { RefreshToken } from "../../../domain/entities/RefreshToken.js";
import type { User } from "../../../domain/entities/User.js";
import type { Clock } from "../../../domain/ports/Clock.js";
import type { IdGenerator } from "../../../domain/ports/IdGenerator.js";
import type { RefreshTokenHasher } from "../../../domain/ports/RefreshTokenHasher.js";
import type { RefreshTokenRepository } from "../../../domain/ports/RefreshTokenRepository.js";
import type { TokenSigner } from "../../../domain/ports/TokenSigner.js";

export interface IssueTokensDeps {
  refreshTokens: RefreshTokenRepository;
  tokenSigner: TokenSigner;
  refreshHasher: RefreshTokenHasher;
  ids: IdGenerator;
  clock: Clock;
  refreshTokenTtlSeconds: number;
}

export interface IssueTokensResult {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: User;
}

export async function issueTokensForUser(
  deps: IssueTokensDeps,
  user: User,
  opts: { family?: string } = {},
): Promise<IssueTokensResult> {
  const now = deps.clock.now();

  const access = await deps.tokenSigner.signAccess({
    sub: user.id,
    kyc: user.kycStatus,
    roles: user.roles,
  });

  const refreshPlaintext = deps.refreshHasher.generate();
  const refreshHash = deps.refreshHasher.hash(refreshPlaintext);
  const refreshExpiresAt = new Date(now.getTime() + deps.refreshTokenTtlSeconds * 1000);

  const refresh = RefreshToken.create({
    id: deps.ids.uuid(),
    userId: user.id,
    family: opts.family ?? deps.ids.uuid(),
    tokenHash: refreshHash,
    expiresAt: refreshExpiresAt,
    now,
  });
  await deps.refreshTokens.save(refresh);

  return {
    accessToken: access.token,
    accessTokenExpiresAt: access.expiresAt,
    refreshToken: refreshPlaintext,
    refreshTokenExpiresAt: refreshExpiresAt,
    user,
  };
}
