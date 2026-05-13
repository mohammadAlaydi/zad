// Composition root for the KYC module.

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { logger } from "../../infra/logger/index.js";
import type { EventBus } from "../../shared/events/EventBus.js";
import { EnsureApplicationCommand } from "./application/commands/EnsureApplication.js";
import { NotifyDocumentUploadedCommand } from "./application/commands/NotifyDocumentUploaded.js";
import { PresignDocumentCommand } from "./application/commands/PresignDocument.js";
import { RecordProviderDecisionCommand } from "./application/commands/RecordProviderDecision.js";
import { SubmitForReviewCommand } from "./application/commands/SubmitForReview.js";
import { GetMyApplicationQuery } from "./application/queries/GetMyApplication.js";
import { InMemoryDocumentStorage } from "./infrastructure/adapters/InMemoryDocumentStorage.js";
import { InMemoryKycProvider } from "./infrastructure/adapters/InMemoryKycProvider.js";
import { RandomIdGenerator } from "./infrastructure/adapters/RandomIdGenerator.js";
import { SystemClock } from "./infrastructure/adapters/SystemClock.js";
import { PrismaKycApplicationRepository } from "./infrastructure/repositories/PrismaKycApplicationRepository.js";
import { PrismaKycDocumentRepository } from "./infrastructure/repositories/PrismaKycDocumentRepository.js";
import { registerKycRoutes } from "./interface/routes/applications.js";

export interface KycModuleConfig {
  publicBaseUrl: string; // used by InMemoryDocumentStorage's dev URLs
  inMemoryAutoApproveMs: number; // 0 disables auto-approval
}

export async function registerKycModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  events: EventBus,
  config: KycModuleConfig,
): Promise<void> {
  const applications = new PrismaKycApplicationRepository(prisma);
  const documents = new PrismaKycDocumentRepository(prisma);
  const storage = new InMemoryDocumentStorage({ baseUrl: config.publicBaseUrl });
  const ids = new RandomIdGenerator();
  const clock = new SystemClock();

  const recordDecision = new RecordProviderDecisionCommand({ applications, clock, events });

  // The in-memory provider calls back into RecordProviderDecision when its
  // auto-approve timer fires. The callback uses the same use case the real
  // webhook receivers (Phase 2) will call — one code path, two triggers.
  const provider = new InMemoryKycProvider(config.inMemoryAutoApproveMs, async (input) => {
    const result = await recordDecision.execute(input);
    if (!result.ok) {
      logger.error(
        { applicationId: input.applicationId, err: result.error.code },
        "KYC auto-decision failed to apply",
      );
    }
  });

  const ensure = new EnsureApplicationCommand({
    applications,
    ids,
    clock,
    events,
    provider: "inmem",
  });
  const submit = new SubmitForReviewCommand({ applications, documents, provider, clock, events });
  const presign = new PresignDocumentCommand({ applications, documents, storage, ids, clock });
  const notifyUploaded = new NotifyDocumentUploadedCommand({
    applications,
    documents,
    clock,
    events,
  });
  const query = new GetMyApplicationQuery({ applications, documents });

  await registerKycRoutes(app, { ensure, submit, presign, notifyUploaded, query });
}
