import { ok, type Result, err } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { InvalidCredentials } from "../../domain/errors/index.js";
import type { LoginFailed, LoginSucceeded } from "../../domain/events/index.js";
import type { PasswordHasher } from "../../domain/ports/PasswordHasher.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import { Email } from "../../domain/value-objects/Email.js";
import {
  issueTokensForUser,
  type IssueTokensDeps,
  type IssueTokensResult,
} from "./shared/issueTokens.js";

export interface LoginInput {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginDeps extends IssueTokensDeps {
  users: UserRepository;
  passwordHasher: PasswordHasher;
  events: EventBus;
}

export class LoginCommand {
  constructor(private readonly deps: LoginDeps) {}

  async execute(input: LoginInput): Promise<Result<IssueTokensResult, InvalidCredentials>> {
    // Normalize before lookup so case/whitespace can't bypass uniqueness.
    let email: Email;
    try {
      email = Email.of(input.email);
    } catch {
      return err(new InvalidCredentials());
    }

    const user = await this.deps.users.findByEmail(email);
    // Same error for both "no user" and "wrong password" so we don't leak
    // account existence to an unauthenticated client.
    if (user === null) {
      await this.publishFailure(input, "user_not_found");
      return err(new InvalidCredentials());
    }
    const passwordOk = await this.deps.passwordHasher.verify(input.password, user.passwordHash);
    if (!passwordOk) {
      await this.publishFailure(input, "bad_password");
      return err(new InvalidCredentials());
    }

    const tokens = await issueTokensForUser(this.deps, user);
    const successEvent: LoginSucceeded = {
      name: "identity.LoginSucceeded",
      aggregateId: user.id,
      occurredAt: this.deps.clock.now(),
      payload: { userId: user.id, ip: input.ip, userAgent: input.userAgent },
    };
    await this.deps.events.publish(successEvent);
    return ok(tokens);
  }

  private async publishFailure(input: LoginInput, reason: string): Promise<void> {
    const failure: LoginFailed = {
      name: "identity.LoginFailed",
      aggregateId: "00000000-0000-0000-0000-000000000000",
      occurredAt: this.deps.clock.now(),
      payload: { email: input.email, reason, ip: input.ip },
    };
    await this.deps.events.publish(failure);
  }
}
