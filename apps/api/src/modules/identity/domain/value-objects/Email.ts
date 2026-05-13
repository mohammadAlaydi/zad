// RFC 5322 is impractical to validate exactly; we use a pragmatic regex
// + length cap. Real validation happens at the boundary (Zod) — the VO
// guarantees normalized form (lowercase + trimmed) inside the domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(public readonly value: string) {}

  static of(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
      throw new Error(`Invalid email: ${raw}`);
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
