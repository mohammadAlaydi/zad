// In-memory test doubles for the identity module's ports. Hexagonal
// architecture pays off here — we drive every use case with zero infra.

import { RefreshToken } from "../../src/modules/identity/domain/entities/RefreshToken.js";
import type { User } from "../../src/modules/identity/domain/entities/User.js";
import type { Clock } from "../../src/modules/identity/domain/ports/Clock.js";
import type { IdGenerator } from "../../src/modules/identity/domain/ports/IdGenerator.js";
import type { PasswordHasher } from "../../src/modules/identity/domain/ports/PasswordHasher.js";
import type { RefreshTokenHasher } from "../../src/modules/identity/domain/ports/RefreshTokenHasher.js";
import type { RefreshTokenRepository } from "../../src/modules/identity/domain/ports/RefreshTokenRepository.js";
import type {
  AccessTokenClaims,
  AccessTokenIssued,
  TokenSigner,
} from "../../src/modules/identity/domain/ports/TokenSigner.js";
import type { UserRepository } from "../../src/modules/identity/domain/ports/UserRepository.js";
import type { Email } from "../../src/modules/identity/domain/value-objects/Email.js";
import type { DomainEvent } from "../../src/shared/events/DomainEvent.js";
import type { EventBus, EventHandler } from "../../src/shared/events/EventBus.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byEmail = new Map<string, User>();
  private readonly byPhone = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    return this.byEmail.get(email.value) ?? null;
  }
  async findByPhone(phone: string): Promise<User | null> {
    return this.byPhone.get(phone) ?? null;
  }
  async save(user: User): Promise<void> {
    this.byId.set(user.id, user);
    if (user.email !== null) this.byEmail.set(user.email.value, user);
    if (user.phone !== null) this.byPhone.set(user.phone, user);
  }
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  readonly tokens = new Map<string, RefreshToken>();
  // Tracks if revokeFamily fired for assertions.
  readonly revokedFamilies: string[] = [];

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    for (const t of this.tokens.values()) {
      if (t.tokenHash === tokenHash) return t;
    }
    return null;
  }
  async save(token: RefreshToken): Promise<void> {
    this.tokens.set(token.id, token);
  }
  async rotate(oldId: string, newToken: RefreshToken): Promise<void> {
    const old = this.tokens.get(oldId);
    if (old === undefined) throw new Error("rotate: old token not in store");
    this.tokens.set(
      old.id,
      RefreshToken.rehydrate({
        id: old.id,
        userId: old.userId,
        family: old.family,
        tokenHash: old.tokenHash,
        expiresAt: old.expiresAt,
        createdAt: old.createdAt,
        revokedAt: new Date(),
        rotatedTo: newToken.id,
      }),
    );
    this.tokens.set(newToken.id, newToken);
  }
  async revokeFamily(family: string): Promise<void> {
    this.revokedFamilies.push(family);
    for (const [id, token] of this.tokens) {
      if (token.family === family && token.revokedAt === null) {
        this.tokens.set(
          id,
          RefreshToken.rehydrate({
            id: token.id,
            userId: token.userId,
            family: token.family,
            tokenHash: token.tokenHash,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            revokedAt: new Date(),
            rotatedTo: token.rotatedTo,
          }),
        );
      }
    }
  }

  async findActiveByUser(userId: string, now: Date): Promise<readonly RefreshToken[]> {
    const out: RefreshToken[] = [];
    for (const t of this.tokens.values()) {
      if (
        t.userId === userId &&
        t.revokedAt === null &&
        t.rotatedTo === null &&
        t.expiresAt.getTime() > now.getTime()
      ) {
        out.push(t);
      }
    }
    return out;
  }

  async revokeById(id: string, userId: string, now: Date): Promise<boolean> {
    const t = this.tokens.get(id);
    if (t === undefined || t.userId !== userId || t.revokedAt !== null) return false;
    this.tokens.set(
      id,
      RefreshToken.rehydrate({
        id: t.id,
        userId: t.userId,
        family: t.family,
        tokenHash: t.tokenHash,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt,
        revokedAt: now,
        rotatedTo: t.rotatedTo,
      }),
    );
    return true;
  }

  async revokeAllForUser(userId: string, now: Date): Promise<number> {
    let n = 0;
    for (const [id, t] of this.tokens) {
      if (t.userId === userId && t.revokedAt === null) {
        this.tokens.set(
          id,
          RefreshToken.rehydrate({
            id: t.id,
            userId: t.userId,
            family: t.family,
            tokenHash: t.tokenHash,
            expiresAt: t.expiresAt,
            createdAt: t.createdAt,
            revokedAt: now,
            rotatedTo: t.rotatedTo,
          }),
        );
        n++;
      }
    }
    return n;
  }
}

// Plaintext password "p" hashes to "h:p". Deterministic; never use in prod.
export class FakePasswordHasher implements PasswordHasher {
  async hash(plaintext: string): Promise<string> {
    return `h:${plaintext}`;
  }
  async verify(plaintext: string, hash: string): Promise<boolean> {
    return hash === `h:${plaintext}`;
  }
}

export class FakeTokenSigner implements TokenSigner {
  constructor(private readonly accessTtlSeconds: number) {}
  signedTokens: AccessTokenClaims[] = [];

  async signAccess(claims: AccessTokenClaims): Promise<AccessTokenIssued> {
    this.signedTokens.push(claims);
    return {
      token: `at:${claims.sub}:${this.signedTokens.length}`,
      expiresAt: new Date(Date.now() + this.accessTtlSeconds * 1000),
    };
  }
  async verifyAccess(token: string): Promise<AccessTokenClaims> {
    const m = /^at:([^:]+):/.exec(token);
    if (m === null || m[1] === undefined) throw new Error("bad fake token");
    return { sub: m[1], kyc: "not_started", roles: ["customer"] };
  }
}

export class FakeRefreshTokenHasher implements RefreshTokenHasher {
  private counter = 0;
  generate(): string {
    this.counter += 1;
    return `refresh-${String(this.counter)}`;
  }
  hash(plaintext: string): string {
    return `H:${plaintext}`;
  }
}

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return new Date(this.current.getTime());
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
  set(date: Date): void {
    this.current = new Date(date.getTime());
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  uuid(): string {
    this.counter += 1;
    return `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`;
  }
}

export class RecordingEventBus implements EventBus {
  readonly published: DomainEvent[] = [];
  private readonly handlers = new Map<string, Array<EventHandler<DomainEvent>>>();

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
    const list = this.handlers.get(event.name) ?? [];
    await Promise.all(list.map((h) => h(event)));
  }
  subscribe<E extends DomainEvent>(name: E["name"], handler: EventHandler<E>): void {
    const list = this.handlers.get(name) ?? [];
    list.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(name, list);
  }
}
