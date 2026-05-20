import { ok, type Result } from "@zadpay/errors";
import { logger } from "../../../../infra/logger/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import { isKycStatus, type KycStatus } from "../../domain/value-objects/KycStatus.js";

export interface UpdateKycStatusInput {
  userId: string;
  status: string; // narrowed via isKycStatus; we accept string for ergonomics at the subscriber boundary
}

export interface UpdateKycStatusDeps {
  users: UserRepository;
  clock: Clock;
}

// Internal — driven by the cross-module subscription on kyc.* events
// (see register.ts). The new kyc value lands on User.kycStatus so the next
// /v1/auth/refresh issues an access token with the right claim.
export class UpdateKycStatusCommand {
  constructor(private readonly deps: UpdateKycStatusDeps) {}

  async execute(input: UpdateKycStatusInput): Promise<Result<void, never>> {
    const user = await this.deps.users.findById(input.userId);
    if (user === null) {
      logger.warn({ userId: input.userId }, "UpdateKycStatus: user not found");
      return ok(undefined);
    }
    if (!isKycStatus(input.status)) {
      logger.warn({ status: input.status }, "UpdateKycStatus: unknown status");
      return ok(undefined);
    }
    const next: KycStatus = input.status;
    if (user.kycStatus === next) return ok(undefined);

    // Re-construct the user with the new status. The User entity is
    // immutable; we use rehydrate to keep the original createdAt/id.
    const updated = (await import("../../domain/entities/User.js")).User.rehydrate({
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      kycStatus: next,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: this.deps.clock.now(),
    });
    await this.deps.users.save(updated);
    logger.info({ userId: user.id, kycStatus: next }, "User.kycStatus updated");
    return ok(undefined);
  }
}
