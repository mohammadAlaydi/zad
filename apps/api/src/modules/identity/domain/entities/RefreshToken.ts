// Refresh token aggregate. The plaintext is never stored — only the
// HMAC-SHA256 hash (via RefreshTokenHasher). The plaintext is shown to the
// client exactly once at issue time; on every subsequent use it's hashed
// again for DB lookup. ADR-0006.

export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly family: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly revokedAt: Date | null,
    public readonly rotatedTo: string | null,
  ) {}

  static rehydrate(props: {
    id: string;
    userId: string;
    family: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
    rotatedTo: string | null;
  }): RefreshToken {
    return new RefreshToken(
      props.id,
      props.userId,
      props.family,
      props.tokenHash,
      props.expiresAt,
      props.createdAt,
      props.revokedAt,
      props.rotatedTo,
    );
  }

  static create(props: {
    id: string;
    userId: string;
    family: string;
    tokenHash: string;
    expiresAt: Date;
    now: Date;
  }): RefreshToken {
    return new RefreshToken(
      props.id,
      props.userId,
      props.family,
      props.tokenHash,
      props.expiresAt,
      props.now,
      null,
      null,
    );
  }

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  // A revoked token that has been rotated, presented again = replay attack.
  // The use case must revoke the whole family and alert.
  isReplay(): boolean {
    return this.isRevoked() && this.rotatedTo !== null;
  }
}
