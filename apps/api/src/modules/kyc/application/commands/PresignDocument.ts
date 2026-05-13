import { err, ok, type Result } from "@zadpay/errors";
import { KycDocument } from "../../domain/entities/KycDocument.js";
import { ApplicationNotFound } from "../../domain/errors/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { DocumentStorage, PresignedUpload } from "../../domain/ports/DocumentStorage.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";
import type { KycDocumentRepository } from "../../domain/ports/KycDocumentRepository.js";
import type { AllowedMimeType, DocumentType } from "../../domain/value-objects/DocumentType.js";

export interface PresignDocumentInput {
  userId: string;
  type: DocumentType;
  mimeType: AllowedMimeType;
}

export interface PresignDocumentResult {
  documentId: string;
  presigned: PresignedUpload;
}

export interface PresignDocumentDeps {
  applications: KycApplicationRepository;
  documents: KycDocumentRepository;
  storage: DocumentStorage;
  ids: IdGenerator;
  clock: Clock;
}

// Records a pending KycDocument row + asks the storage adapter for a
// short-lived presigned upload URL. The mobile then PUTs bytes directly
// to that URL; origin servers never touch them. ADR-0008.
export class PresignDocumentCommand {
  constructor(private readonly deps: PresignDocumentDeps) {}

  async execute(
    input: PresignDocumentInput,
  ): Promise<Result<PresignDocumentResult, ApplicationNotFound>> {
    const application = await this.deps.applications.findByUserId(input.userId);
    if (application === null) return err(new ApplicationNotFound());

    const documentId = this.deps.ids.uuid();
    const presigned = await this.deps.storage.presignUpload({
      applicationId: application.id,
      documentId,
      type: input.type,
      mimeType: input.mimeType,
    });

    const doc = KycDocument.create({
      id: documentId,
      applicationId: application.id,
      type: input.type,
      s3Key: presigned.s3Key,
      mimeType: input.mimeType,
      now: this.deps.clock.now(),
    });
    await this.deps.documents.save(doc);

    return ok({ documentId, presigned });
  }
}
