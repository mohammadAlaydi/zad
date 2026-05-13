import { createHmac, randomBytes } from "node:crypto";
import type { RefreshTokenHasher } from "../../domain/ports/RefreshTokenHasher.js";

// HMAC-SHA256 keyed by REFRESH_TOKEN_PEPPER. Deterministic — we need this
// so an incoming refresh token can be looked up by its hash.
export class HmacRefreshTokenHasher implements RefreshTokenHasher {
  constructor(private readonly pepper: string) {}

  generate(): string {
    return randomBytes(32).toString("base64url");
  }

  hash(plaintext: string): string {
    return createHmac("sha256", this.pepper).update(plaintext).digest("base64url");
  }
}
