import { err, ok, type Result } from "@zadpay/errors";
import { UserNotFound } from "../../domain/errors/index.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export interface GetMeInput {
  userId: string;
}

export interface MeView {
  id: string;
  email: string;
  kycStatus: string;
  roles: readonly string[];
  createdAt: Date;
}

export interface GetMeDeps {
  users: UserRepository;
}

export class GetMeQuery {
  constructor(private readonly deps: GetMeDeps) {}

  async execute(input: GetMeInput): Promise<Result<MeView, UserNotFound>> {
    const user = await this.deps.users.findById(input.userId);
    if (user === null) return err(new UserNotFound());
    return ok({
      id: user.id,
      email: user.email.value,
      kycStatus: user.kycStatus,
      roles: user.roles,
      createdAt: user.createdAt,
    });
  }
}
