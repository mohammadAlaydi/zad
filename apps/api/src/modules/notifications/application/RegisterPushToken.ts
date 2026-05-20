import { ok, type Result } from "@zadpay/errors";
import type { PushTokenRepository } from "../domain/ports/PushTokenRepository.js";

export interface RegisterPushTokenInput {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  deviceName?: string | null;
}

export interface RegisterPushTokenDeps {
  tokens: PushTokenRepository;
}

export class RegisterPushTokenCommand {
  constructor(private readonly deps: RegisterPushTokenDeps) {}

  async execute(input: RegisterPushTokenInput): Promise<Result<void, never>> {
    await this.deps.tokens.upsert({
      userId: input.userId,
      token: input.token,
      platform: input.platform,
      deviceName: input.deviceName ?? null,
    });
    return ok(undefined);
  }
}

export interface UnregisterPushTokenInput {
  token: string;
}

export class UnregisterPushTokenCommand {
  constructor(private readonly deps: RegisterPushTokenDeps) {}

  async execute(input: UnregisterPushTokenInput): Promise<Result<void, never>> {
    await this.deps.tokens.remove(input.token);
    return ok(undefined);
  }
}
