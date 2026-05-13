// Refresh tokens need DB lookup by hash → must be deterministic. argon2id
// has per-hash salts and isn't usable here. We use HMAC-SHA256 keyed by
// REFRESH_TOKEN_PEPPER (ADR-0006).
//
// Plaintext is shown to the client once at issue time; the server only ever
// stores the hash and recomputes it from the plaintext for each lookup.
export interface RefreshTokenHasher {
  /// 32 random bytes, base64url-encoded.
  generate(): string;
  /// HMAC-SHA256(pepper, plaintext). Deterministic.
  hash(plaintext: string): string;
}
