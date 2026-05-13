import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import type { PasswordHasher } from "../../domain/ports/PasswordHasher.js";

// OWASP-recommended argon2id parameters. Tuned for ~50–150 ms per hash on
// a typical x86_64 server — the cost lives only on login/registration, not
// in the request hot path.
// @node-rs/argon2 defaults to argon2id, so we omit `algorithm` (the const
// enum is incompatible with isolatedModules).
const OPTIONS = {
  memoryCost: 19_456, // KiB
  timeCost: 2,
  parallelism: 1,
} as const;

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plaintext: string): Promise<string> {
    return argonHash(plaintext, OPTIONS);
  }

  async verify(plaintext: string, hash: string): Promise<boolean> {
    try {
      return await argonVerify(hash, plaintext, OPTIONS);
    } catch {
      // Malformed hash → treat as mismatch, never throw to the use case.
      return false;
    }
  }
}
