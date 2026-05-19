import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { PrismaUserItemRepository } from "./infrastructure/PrismaUserItemRepository.js";
import { registerUserdataRoutes } from "./interface/routes.js";

// Intentionally empty — module has no boot-time config. Kept for symmetry
// with the other modules' registration shape.
export interface UserdataModuleConfig {
  _?: never;
}

export async function registerUserdataModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  _config?: UserdataModuleConfig,
): Promise<void> {
  const items = new PrismaUserItemRepository(prisma);
  await registerUserdataRoutes(app, { items });
}
