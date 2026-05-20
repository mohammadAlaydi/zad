import { err, ok, type Result } from "@zadpay/errors";
import { InvalidPassword, UserNotFound } from "../../domain/errors/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { PasswordHasher } from "../../domain/ports/PasswordHasher.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordDeps {
  users: UserRepository;
  passwordHasher: PasswordHasher;
  clock: Clock;
}

export class ChangePasswordCommand {
  constructor(private readonly deps: ChangePasswordDeps) {}

  async execute(input: ChangePasswordInput): Promise<Result<void, UserNotFound | InvalidPassword>> {
    const user = await this.deps.users.findById(input.userId);
    if (user === null) return err(new UserNotFound());

    const matches = await this.deps.passwordHasher.verify(input.currentPassword, user.passwordHash);
    if (!matches) return err(new InvalidPassword());

    const newHash = await this.deps.passwordHasher.hash(input.newPassword);
    const updated = user.withPasswordHash(newHash, this.deps.clock.now());
    await this.deps.users.save(updated);
    return ok(undefined);
  }
}
