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
import { InvalidCredentials } from "../../domain/errors/index.js";
import { Email } from "../../domain/value-objects/Email.js";
import { LoginCommand } from "./Login.js";

describe("LoginCommand", () => {
  let users: InMemoryUserRepository;
  let refreshTokens: InMemoryRefreshTokenRepository;
  let passwordHasher: FakePasswordHasher;
  let refreshHasher: FakeRefreshTokenHasher;
  let tokenSigner: FakeTokenSigner;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let events: RecordingEventBus;
  let login: LoginCommand;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    refreshTokens = new InMemoryRefreshTokenRepository();
    passwordHasher = new FakePasswordHasher();
    refreshHasher = new FakeRefreshTokenHasher();
    tokenSigner = new FakeTokenSigner(900);
    ids = new SequentialIdGenerator();
    clock = new FixedClock(new Date("2026-05-13T12:00:00Z"));
    events = new RecordingEventBus();

    const user = User.create({
      id: ids.uuid(),
      email: Email.of("alice@example.com"),
      passwordHash: await passwordHasher.hash("correct horse battery staple"),
      now: clock.now(),
    });
    await users.save(user);

    login = new LoginCommand({
      users,
      refreshTokens,
      passwordHasher,
      tokenSigner,
      refreshHasher,
      ids,
      clock,
      events,
      refreshTokenTtlSeconds: 604_800,
    });
  });

  it("issues tokens for valid credentials", async () => {
    const result = await login.execute({
      email: "alice@example.com",
      password: "correct horse battery staple",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.accessToken).toMatch(/^at:/);
    expect(result.value.refreshToken).toMatch(/^refresh-/);
    expect(result.value.user.email.value).toBe("alice@example.com");
    expect(refreshTokens.tokens.size).toBe(1);
    expect(events.published[0]?.name).toBe("identity.LoginSucceeded");
  });

  it("returns InvalidCredentials when email is unknown (no leak)", async () => {
    const result = await login.execute({
      email: "ghost@example.com",
      password: "anything",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidCredentials);
    expect(events.published[0]?.name).toBe("identity.LoginFailed");
  });

  it("returns InvalidCredentials when password is wrong (no leak)", async () => {
    const result = await login.execute({
      email: "alice@example.com",
      password: "wrong",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidCredentials);
    expect(events.published[0]?.name).toBe("identity.LoginFailed");
  });

  it("returns InvalidCredentials when email is malformed (no Email VO throw bubbling)", async () => {
    const result = await login.execute({ email: "not-an-email", password: "x" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidCredentials);
  });

  it("normalizes email case before lookup", async () => {
    const result = await login.execute({
      email: "ALICE@example.com",
      password: "correct horse battery staple",
    });
    expect(result.ok).toBe(true);
  });
});
