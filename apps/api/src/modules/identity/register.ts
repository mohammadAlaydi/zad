// Composition root for the identity module. Called from apps/api/src/app.ts.
// Wires the use cases with their concrete adapters and registers the routes.
// Nothing outside this file knows about the module's internals.

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { EventBus } from "../../shared/events/EventBus.js";
import type { KycApplicationApproved, KycApplicationRejected } from "../kyc/index.js";
import { ChangePasswordCommand } from "./application/commands/ChangePassword.js";
import { LoginCommand } from "./application/commands/Login.js";
import { LoginByPhoneCommand } from "./application/commands/LoginByPhone.js";
import { LogoutCommand } from "./application/commands/Logout.js";
import { RefreshCommand } from "./application/commands/Refresh.js";
import { RegisterCommand } from "./application/commands/Register.js";
import { UpdateKycStatusCommand } from "./application/commands/UpdateKycStatus.js";
import { UpdateProfileCommand } from "./application/commands/UpdateProfile.js";
import { GetMeQuery } from "./application/queries/GetMe.js";
import { type UserLookup, UserRepositoryUserLookup } from "./application/queries/LookupById.js";
import {
  type PhoneLookup,
  UserRepositoryPhoneLookup,
} from "./application/queries/LookupByPhone.js";
import { Argon2PasswordHasher } from "./infrastructure/adapters/Argon2PasswordHasher.js";
import { HmacRefreshTokenHasher } from "./infrastructure/adapters/HmacRefreshTokenHasher.js";
import { JoseTokenSigner } from "./infrastructure/adapters/JoseTokenSigner.js";
import { RandomIdGenerator } from "./infrastructure/adapters/RandomIdGenerator.js";
import { SystemClock } from "./infrastructure/adapters/SystemClock.js";
import { PrismaRefreshTokenRepository } from "./infrastructure/repositories/PrismaRefreshTokenRepository.js";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository.js";
import { registerAuthRoutes } from "./interface/routes/auth.js";
import { type PhoneAccountResolver, registerLookupRoutes } from "./interface/routes/lookup.js";
import { registerMeRoutes } from "./interface/routes/me.js";

export interface IdentityModuleConfig {
  jwtSigningKeyPem: string;
  jwtVerifyKeyPem: string;
  refreshTokenPepper: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}

// Handles exposed back to app.ts so other modules (wallet) can consume
// read-only identity capabilities without importing internals.
export interface IdentityModuleHandles {
  phoneLookup: PhoneLookup;
  userLookup: UserLookup;
  // Registered AFTER wallet so we can wire wallet's account lookup back
  // into identity's recipient-lookup route.
  registerLookup(accounts: PhoneAccountResolver): Promise<void>;
}

export async function registerIdentityModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  events: EventBus,
  config: IdentityModuleConfig,
): Promise<IdentityModuleHandles> {
  const users = new PrismaUserRepository(prisma);
  const refreshTokens = new PrismaRefreshTokenRepository(prisma);
  const passwordHasher = new Argon2PasswordHasher();
  const refreshHasher = new HmacRefreshTokenHasher(config.refreshTokenPepper);
  const tokenSigner = await JoseTokenSigner.create({
    privateKeyPem: config.jwtSigningKeyPem,
    publicKeyPem: config.jwtVerifyKeyPem,
    accessTokenTtlSeconds: config.accessTokenTtlSeconds,
  });
  const ids = new RandomIdGenerator();
  const clock = new SystemClock();

  // Decorate Fastify so the auth middleware can verify access tokens
  // without holding a closure on a particular signer.
  app.decorate("tokenSigner", tokenSigner);

  const shared = {
    refreshTokens,
    tokenSigner,
    refreshHasher,
    ids,
    clock,
    refreshTokenTtlSeconds: config.refreshTokenTtlSeconds,
  };

  const login = new LoginCommand({ ...shared, users, passwordHasher, events });
  const loginByPhone = new LoginByPhoneCommand({ ...shared, users, passwordHasher, events });
  const refresh = new RefreshCommand({ ...shared, users, events });
  const logout = new LogoutCommand({ refreshTokens, refreshHasher, clock, events });
  const register = new RegisterCommand({ ...shared, users, passwordHasher, events });
  const getMe = new GetMeQuery({ users });
  const updateKycStatus = new UpdateKycStatusCommand({ users, clock });
  const changePassword = new ChangePasswordCommand({ users, passwordHasher, clock });
  const updateProfile = new UpdateProfileCommand({ users, clock });
  const phoneLookup = new UserRepositoryPhoneLookup(users);
  const userLookup = new UserRepositoryUserLookup(users);

  // Cross-module event subscription. KYC publishes status changes; identity
  // reflects them onto User.kycStatus so the next /v1/auth/refresh issues
  // an access token with the right `kyc` claim. Per ADR-0005 this is the
  // sole allowed coupling between modules — both sides see only the event
  // shape, not each other's internals.
  events.subscribe<KycApplicationApproved>("kyc.ApplicationApproved", async (evt) => {
    await updateKycStatus.execute({ userId: evt.payload.userId, status: "approved" });
  });
  events.subscribe<KycApplicationRejected>("kyc.ApplicationRejected", async (evt) => {
    await updateKycStatus.execute({ userId: evt.payload.userId, status: "rejected" });
  });

  await registerAuthRoutes(app, { login, loginByPhone, refresh, logout, register });
  await registerMeRoutes(app, { getMe, updateProfile });

  return {
    phoneLookup,
    userLookup,
    registerLookup: async (accounts: PhoneAccountResolver): Promise<void> => {
      await registerLookupRoutes(app, { phoneLookup, accounts, changePassword });
    },
  };
}
