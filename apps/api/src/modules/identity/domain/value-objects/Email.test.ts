import { describe, expect, it } from "vitest";
import { Email } from "./Email.js";

describe("Email", () => {
  it("lowercases and trims", () => {
    expect(Email.of("  Alice@Example.COM ").value).toBe("alice@example.com");
  });

  it("rejects malformed", () => {
    expect(() => Email.of("not-an-email")).toThrow();
    expect(() => Email.of("a@b")).toThrow();
    expect(() => Email.of("")).toThrow();
  });

  it("rejects > 254 chars", () => {
    const long = "a".repeat(250) + "@b.com"; // 256 chars total
    expect(() => Email.of(long)).toThrow();
  });

  it("equality is value-based after normalization", () => {
    expect(Email.of("a@b.com").equals(Email.of("A@B.com"))).toBe(true);
  });
});
