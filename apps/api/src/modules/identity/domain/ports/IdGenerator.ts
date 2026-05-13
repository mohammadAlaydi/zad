// Injected ID source. Production = crypto.randomUUID; tests can substitute
// a deterministic stream for predictable assertions.
export interface IdGenerator {
  uuid(): string;
}
