// argon2id per OWASP recommendation (ADR-0006). Production uses a Rust
// binding (@node-rs/argon2); tests can substitute a fast no-op.
export interface PasswordHasher {
  hash(plaintext: string): Promise<string>;
  verify(plaintext: string, hash: string): Promise<boolean>;
}
