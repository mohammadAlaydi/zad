import { ok, type Result, err } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { User } from "../../domain/entities/User.js";
import { EmailAlreadyExists, PhoneAlreadyExists } from "../../domain/errors/index.js";
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
  // Optional — users can register with phone alone and add an email later.
  email?: string;
  password: string;
  phone: string;
  fullName: string;
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

  async execute(
    input: RegisterInput,
  ): Promise<Result<IssueTokensResult, EmailAlreadyExists | PhoneAlreadyExists>> {
    const email = input.email !== undefined ? Email.of(input.email) : null;
    if (email !== null) {
      const existing = await this.deps.users.findByEmail(email);
      if (existing !== null) return err(new EmailAlreadyExists());
    }

    const phoneTaken = await this.deps.users.findByPhone(input.phone);
    if (phoneTaken !== null) return err(new PhoneAlreadyExists());

    const passwordHash = await this.deps.passwordHasher.hash(input.password);
    const now = this.deps.clock.now();
    const user = User.create({
      id: this.deps.ids.uuid(),
      email,
      phone: input.phone,
      fullName: input.fullName,
      passwordHash,
      now,
    });
    await this.deps.users.save(user);

    const event: UserRegistered = {
      name: "identity.UserRegistered",
      aggregateId: user.id,
      occurredAt: now,
      payload: { userId: user.id, email: user.email?.value ?? null },
    };
    await this.deps.events.publish(event);

    const tokens = await issueTokensForUser(this.deps, user);
    return ok(tokens);
  }
}
