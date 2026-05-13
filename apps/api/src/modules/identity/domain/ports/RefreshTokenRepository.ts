import type { RefreshToken } from "../entities/RefreshToken.js";

export interface RefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  save(token: RefreshToken): Promise<void>;
  /// Atomically: mark `oldId` revoked + rotatedTo=newToken.id, insert newToken.
  /// One transaction so we never end up with the old token revoked but the
  /// new one missing.
  rotate(oldId: string, newToken: RefreshToken): Promise<void>;
  /// Revoke every (non-already-revoked) token in this family. Used both for
  /// explicit logout and for replay-detection auto-revocation.
  revokeFamily(family: string): Promise<void>;
}
