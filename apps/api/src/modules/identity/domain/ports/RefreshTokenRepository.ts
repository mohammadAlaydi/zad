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
  /// Active sessions for a user: non-revoked, non-rotated, not expired.
  /// Each row represents a logged-in device.
  findActiveByUser(userId: string, now: Date): Promise<readonly RefreshToken[]>;
  /// Revoke a single token by id. Returns true if a row was updated.
  /// Used by "sign out a specific device" from settings.
  revokeById(id: string, userId: string, now: Date): Promise<boolean>;
  /// Revoke every active token for a user. Used by lost-device lock.
  revokeAllForUser(userId: string, now: Date): Promise<number>;
}
