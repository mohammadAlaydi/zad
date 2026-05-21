import { err, ok, type Result } from "@zadpay/errors";
import { UserNotFound } from "../../domain/errors/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export interface UpdateProfileInput {
  userId: string;
  fullName: string;
}

export interface UpdateProfileDeps {
  users: UserRepository;
  clock: Clock;
}

export interface UpdatedProfileView {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  kycStatus: string;
  roles: readonly string[];
  createdAt: Date;
}

export class UpdateProfileCommand {
  constructor(private readonly deps: UpdateProfileDeps) {}

  async execute(input: UpdateProfileInput): Promise<Result<UpdatedProfileView, UserNotFound>> {
    const user = await this.deps.users.findById(input.userId);
    if (user === null) return err(new UserNotFound());

    const updated = user.withFullName(input.fullName.trim(), this.deps.clock.now());
    await this.deps.users.save(updated);

    return ok({
      id: updated.id,
      email: updated.email?.value ?? null,
      phone: updated.phone,
      fullName: updated.fullName,
      kycStatus: updated.kycStatus,
      roles: updated.roles,
      createdAt: updated.createdAt,
    });
  }
}
