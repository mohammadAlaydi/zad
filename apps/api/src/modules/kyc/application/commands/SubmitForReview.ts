import { err, ok, type Result } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { type KycApplication } from "../../domain/entities/KycApplication.js";
import {
  ApplicationNotFound,
  type IllegalTransition,
  NoDocumentsToSubmit,
} from "../../domain/errors/index.js";
import type { KycApplicationSubmitted } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";
import type { KycDocumentRepository } from "../../domain/ports/KycDocumentRepository.js";
import type { KycProvider } from "../../domain/ports/KycProvider.js";

export interface SubmitForReviewInput {
  userId: string;
}

export interface SubmitForReviewDeps {
  applications: KycApplicationRepository;
  documents: KycDocumentRepository;
  provider: KycProvider;
  clock: Clock;
  events: EventBus;
}

export class SubmitForReviewCommand {
  constructor(private readonly deps: SubmitForReviewDeps) {}

  async execute(
    input: SubmitForReviewInput,
  ): Promise<
    Result<KycApplication, ApplicationNotFound | NoDocumentsToSubmit | IllegalTransition>
  > {
    const application = await this.deps.applications.findByUserId(input.userId);
    if (application === null) return err(new ApplicationNotFound());

    const uploadedCount = await this.deps.documents.countUploadedByApplicationId(application.id);
    if (uploadedCount === 0) return err(new NoDocumentsToSubmit());

    const submitResult = application.submit(this.deps.clock.now());
    if (!submitResult.ok) return submitResult;

    await this.deps.applications.save(submitResult.value);
    await this.deps.provider.submitForReview(submitResult.value.id);

    const event: KycApplicationSubmitted = {
      name: "kyc.ApplicationSubmitted",
      aggregateId: submitResult.value.id,
      occurredAt: this.deps.clock.now(),
      payload: { applicationId: submitResult.value.id, userId: submitResult.value.userId },
    };
    await this.deps.events.publish(event);

    return ok(submitResult.value);
  }
}
