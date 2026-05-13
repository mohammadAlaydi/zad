import * as Crypto from "expo-crypto";

// Generate a UUID v4 for the Idempotency-Key header. expo-crypto uses the
// platform's CSPRNG (SecRandomCopyBytes on iOS, SecureRandom on Android).
// Per ADR-0007 the backend validates the format strictly — must be UUID v4.
export function newIdempotencyKey(): string {
  return Crypto.randomUUID();
}
