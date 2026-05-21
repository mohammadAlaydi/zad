import { beforeEach, describe, expect, it } from "vitest";
import {
  FakePasswordHasher,
  FakeRefreshTokenHasher,
  FakeTokenSigner,
  FixedClock,
  InMemoryRefreshTokenRepository,
  InMemoryUserRepository,
  RecordingEventBus,
  SequentialIdGenerator,
} from "../../../../../test/fakes/identity.js";
import { User } from "../../domain/entities/User.js";
import { RefreshTokenInvalid, RefreshTokenReplay } from "../../domain/errors/index.js";
import { Email } from "../../domain/value-objects/Email.js";
import { LoginCommand } from "./Login.js";
import { RefreshCommand } from "./Refresh.js";

describe("RefreshCommand", () => {
  let users: InMemoryUserRepository;
  let refreshTokens: InMemoryRefreshTokenRepository;
  let passwordHasher: FakePasswordHasher;
  let refreshHasher: FakeRefreshTokenHasher;
  let tokenSigner: FakeTokenSigner;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let events: RecordingEventBus;
  let login: LoginCommand;
  let refresh: RefreshCommand;

  async function freshLogin(): Promise<{ refreshToken: string; family: string }> {
    const res = await login.execute({
      email: "alice@example.com",
      password: "p",
    });
    if (!res.ok) throw new Error("seed login failed");
    const stored = [...refreshTokens.tokens.values()][0];
    if (stored === undefined) throw new Error("no token stored");
    return { refreshToken: res.value.refreshToken, family: stored.family };
  }

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    refreshTokens = new InMemoryRefreshTokenRepository();
    passwordHasher = new FakePasswordHasher();
    refreshHasher = new FakeRefreshTokenHasher();
    tokenSigner = new FakeTokenSigner(900);
    ids = new SequentialIdGenerator();
    clock = new FixedClock(new Date("2026-05-13T12:00:00Z"));
    events = new RecordingEventBus();

    const shared = {
      refreshTokens,
      tokenSigner,
      refreshHasher,
      ids,
      clock,
      refreshTokenTtlSeconds: 604_800,
    };
    login = new LoginCommand({ ...shared, users, passwordHasher, events });
    refresh = new RefreshCommand({ ...shared, users, events });

    const user = User.create({
      id: ids.uuid(),
      email: Email.of("alice@example.com"),
      phone: null,
      fullName: null,
      passwordHash: await passwordHasher.hash("p"),
      now: clock.now(),
    });
    await users.save(user);
  });

  it("rotates the token, keeps the family, and revokes the old one", async () => {
    const { refreshToken: first, family } = await freshLogin();
    events.published.length = 0;

    const result = await refresh.execute({ refreshToken: first });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.refreshToken).not.toBe(first);

    const all = [...refreshTokens.tokens.values()];
    expect(all).toHaveLength(2);
    const old = all.find((t) => t.tokenHash === refreshHasher.hash(first));
    const fresh = all.find((t) => t.tokenHash !== refreshHasher.hash(first));
    expect(old?.revokedAt).not.toBeNull();
    expect(old?.rotatedTo).toBe(fresh?.id);
    expect(fresh?.family).toBe(family);
    expect(events.published.some((e) => e.name === "identity.RefreshTokenRotated")).toBe(true);
  });

  it("rejects an unknown refresh token", async () => {
    const result = await refresh.execute({ refreshToken: "not-a-token" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(RefreshTokenInvalid);
  });

  it("rejects an expired refresh token", async () => {
    const { refreshToken } = await freshLogin();
    clock.advance(604_800_000 + 1000); // 7d + 1s
    const result = await refresh.execute({ refreshToken });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(RefreshTokenInvalid);
  });

  it("detects replay (rotated-out token re-used) and revokes the whole family", async () => {
    const { refreshToken: original, family } = await freshLogin();
    const rotated = await refresh.execute({ refreshToken: original });
    expect(rotated.ok).toBe(true);
    events.published.length = 0;
    refreshTokens.revokedFamilies.length = 0;

    // Attacker re-uses the original (now revoked + rotated) token.
    const result = await refresh.execute({ refreshToken: original });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(RefreshTokenReplay);
    expect(refreshTokens.revokedFamilies).toContain(family);
    expect(events.published.some((e) => e.name === "identity.RefreshTokenReplayed")).toBe(true);
  });

  it("rejects a token that's been revoked without rotation (e.g. via logout)", async () => {
    const { refreshToken, family } = await freshLogin();
    await refreshTokens.revokeFamily(family);

    const result = await refresh.execute({ refreshToken });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(RefreshTokenInvalid);
  });
});
