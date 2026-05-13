// Composition root for the wallet module.

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { logger } from "../../infra/logger/index.js";
import type { EventBus } from "../../shared/events/EventBus.js";
import type { UserRegistered } from "../identity/index.js";
import { EnsureUserWalletCommand } from "./application/commands/EnsureUserWallet.js";
import { GetAccountBalanceQuery } from "./application/queries/GetAccountBalance.js";
import { GetMyAccountsQuery } from "./application/queries/GetMyAccounts.js";
import { ListMyTransactionsQuery } from "./application/queries/ListMyTransactions.js";
import { RandomIdGenerator } from "./infrastructure/adapters/RandomIdGenerator.js";
import { SystemClock } from "./infrastructure/adapters/SystemClock.js";
import { PrismaAccountRepository } from "./infrastructure/repositories/PrismaAccountRepository.js";
import { PrismaTransactionRepository } from "./infrastructure/repositories/PrismaTransactionRepository.js";
import { registerWalletRoutes } from "./interface/routes/accounts.js";

export interface WalletModuleConfig {
  // Default currency for the auto-created wallet on user registration.
  defaultCurrency: "USD" | "AED" | "EUR" | "GBP";
}

export async function registerWalletModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  events: EventBus,
  config: WalletModuleConfig,
): Promise<void> {
  const accounts = new PrismaAccountRepository(prisma);
  const transactions = new PrismaTransactionRepository(prisma);
  const ids = new RandomIdGenerator();
  const clock = new SystemClock();

  const ensureUserWallet = new EnsureUserWalletCommand({ accounts, ids, clock, events });
  const myAccounts = new GetMyAccountsQuery({ accounts });
  const accountBalance = new GetAccountBalanceQuery({ accounts });
  const myTransactions = new ListMyTransactionsQuery({ transactions });

  // Cross-module subscription: new identity users get a default wallet
  // account. The publisher (identity) doesn't know wallet exists; the
  // subscriber sees only the event shape (ADR-0005).
  events.subscribe<UserRegistered>("identity.UserRegistered", async (evt) => {
    const result = await ensureUserWallet.execute({
      userId: evt.payload.userId,
      currency: config.defaultCurrency,
    });
    if (!result.ok) {
      logger.error({ userId: evt.payload.userId }, "Default wallet creation failed");
    }
  });

  await registerWalletRoutes(app, { myAccounts, accountBalance, myTransactions });
}
