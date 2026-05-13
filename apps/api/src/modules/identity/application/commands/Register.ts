import { ok, type Result, err } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { User } from "../../domain/entities/User.js";
import { EmailAlreadyExists } from "../../domain/errors/index.js";
import type { UserRegistered } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { PasswordHasher } from "../../domain/ports/PasswordHasher.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import { Email } from "../../domain/value-objects/Email.js";
import {
  type IssueTokensResult,
  issueTokensForUser,
  type IssueTokensDeps,
} from "./shared/issueTokens.js";

export interface RegisterInput {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface RegisterDeps extends IssueTokensDeps {
  users: UserRepository;
  passwordHasher: PasswordHasher;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
}

export class RegisterCommand {
  constructor(private readonly deps: RegisterDeps) {}

  async execute(input: RegisterInput): Promise<Result<IssueTokensResult, EmailAlreadyExists>> {
    const email = Email.of(input.email);
    const existing = await this.deps.users.findByEmail(email);
    if (existing !== null) return err(new EmailAlreadyExists());

    const passwordHash = await this.deps.passwordHasher.hash(input.password);
    const now = this.deps.clock.now();
    const user = User.create({ id: this.deps.ids.uuid(), email, passwordHash, now });
    await this.deps.users.save(user);

    const event: UserRegistered = {
      name: "identity.UserRegistered",
      aggregateId: user.id,
      occurredAt: now,
      payload: { userId: user.id, email: user.email.value },
    };
    await this.deps.events.publish(event);

    const tokens = await issueTokensForUser(this.deps, user);
    return ok(tokens);
  }
}
