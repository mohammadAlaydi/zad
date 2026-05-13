import { err, ok, type Result } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { DocumentNotFound } from "../../domain/errors/index.js";
import type { KycDocumentUploaded } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";
import type { KycDocumentRepository } from "../../domain/ports/KycDocumentRepository.js";

export interface NotifyDocumentUploadedInput {
  documentId: string;
  userId: string;
  sizeBytes: number | null;
}

export interface NotifyDocumentUploadedDeps {
  applications: KycApplicationRepository;
  documents: KycDocumentRepository;
  clock: Clock;
  events: EventBus;
}

// Confirms the client successfully uploaded to the presigned URL. Marks
// the document `uploaded` and (Phase 2) triggers a head-object check
// against S3 to verify the bytes are actually there.
export class NotifyDocumentUploadedCommand {
  constructor(private readonly deps: NotifyDocumentUploadedDeps) {}

  async execute(input: NotifyDocumentUploadedInput): Promise<Result<void, DocumentNotFound>> {
    const doc = await this.deps.documents.findById(input.documentId);
    if (doc === null) return err(new DocumentNotFound());

    // Ownership: the document must belong to the caller's application.
    const application = await this.deps.applications.findById(doc.applicationId);
    if (application === null || application.userId !== input.userId) {
      return err(new DocumentNotFound());
    }

    const updated = doc.markUploaded(input.sizeBytes, this.deps.clock.now());
    await this.deps.documents.save(updated);

    const event: KycDocumentUploaded = {
      name: "kyc.DocumentUploaded",
      aggregateId: application.id,
      occurredAt: this.deps.clock.now(),
      payload: { applicationId: application.id, documentId: doc.id, type: doc.type },
    };
    await this.deps.events.publish(event);

    return ok(undefined);
  }
}
