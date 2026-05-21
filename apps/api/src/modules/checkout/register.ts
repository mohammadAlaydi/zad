// Composition root for the checkout module.

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { PayCheckoutCommand } from "./application/commands/PayCheckout.js";
import type { MerchantDirectory } from "./domain/ports/MerchantDirectory.js";
import type { WalletTransferGateway } from "./domain/ports/WalletTransferGateway.js";
import { RandomIdGenerator } from "./infrastructure/adapters/RandomIdGenerator.js";
import { SystemClock } from "./infrastructure/adapters/SystemClock.js";
import { PrismaOrderRepository } from "./infrastructure/repositories/PrismaOrderRepository.js";
import { registerPayRoutes } from "./interface/routes/pay.js";

export interface CheckoutModuleDeps {
  // Resolves merchant phone → user id. Wired to identity's phoneLookup.
  merchants: MerchantDirectory;
  // Moves money between two users' wallets. Wired to wallet's
  // transferBetweenUsers handle.
  wallet: WalletTransferGateway;
}

export async function registerCheckoutModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  deps: CheckoutModuleDeps,
): Promise<void> {
  const orders = new PrismaOrderRepository(prisma);
  const ids = new RandomIdGenerator();
  const clock = new SystemClock();

  const pay = new PayCheckoutCommand({
    orders,
    merchants: deps.merchants,
    wallet: deps.wallet,
    ids,
    clock,
  });

  await registerPayRoutes(app, { pay });
}
