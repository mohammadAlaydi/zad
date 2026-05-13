// Composition root for the identity module. Called from apps/api/src/app.ts.
// Wires the use cases with their concrete adapters and registers the routes.
// Nothing outside this file knows about the module's internals.

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { EventBus } from "../../shared/events/EventBus.js";
import { LoginCommand } from "./application/commands/Login.js";
import { LogoutCommand } from "./application/commands/Logout.js";
import { RefreshCommand } from "./application/commands/Refresh.js";
import { RegisterCommand } from "./application/commands/Register.js";
import { GetMeQuery } from "./application/queries/GetMe.js";
import { Argon2PasswordHasher } from "./infrastructure/adapters/Argon2PasswordHasher.js";
import { HmacRefreshTokenHasher } from "./infrastructure/adapters/HmacRefreshTokenHasher.js";
import { JoseTokenSigner } from "./infrastructure/adapters/JoseTokenSigner.js";
import { RandomIdGenerator } from "./infrastructure/adapters/RandomIdGenerator.js";
import { SystemClock } from "./infrastructure/adapters/SystemClock.js";
import { PrismaRefreshTokenRepository } from "./infrastructure/repositories/PrismaRefreshTokenRepository.js";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository.js";
import { registerAuthRoutes } from "./interface/routes/auth.js";
import { registerMeRoutes } from "./interface/routes/me.js";

export interface IdentityModuleConfig {
  jwtSigningKeyPem: string;
  jwtVerifyKeyPem: string;
  refreshTokenPepper: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}

export async function registerIdentityModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  events: EventBus,
  config: IdentityModuleConfig,
): Promise<void> {
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
  const refresh = new RefreshCommand({ ...shared, users, events });
  const logout = new LogoutCommand({ refreshTokens, refreshHasher, clock, events });
  const register = new RegisterCommand({ ...shared, users, passwordHasher, events });
  const getMe = new GetMeQuery({ users });

  await registerAuthRoutes(app, { login, refresh, logout, register });
  await registerMeRoutes(app, { getMe });
}
