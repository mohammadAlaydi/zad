// Ed25519 JWT signer (ADR-0006). Access tokens are short-lived (15 min by
// default); refresh tokens are NOT JWTs (they're opaque + HMAC-hashed for
// rotation tracking — see RefreshTokenHasher).

export interface AccessTokenClaims {
  sub: string; // user id
  kyc: string; // kyc_status
  roles: readonly string[];
}

export interface AccessTokenIssued {
  token: string;
  expiresAt: Date;
}

export interface TokenSigner {
  signAccess(claims: AccessTokenClaims): Promise<AccessTokenIssued>;
  verifyAccess(token: string): Promise<AccessTokenClaims>;
}
