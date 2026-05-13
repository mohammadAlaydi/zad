import { err, ok, type Result } from "@zadpay/errors";
import type { KycDocument } from "../../domain/entities/KycDocument.js";
import { ApplicationNotFound } from "../../domain/errors/index.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";
import type { KycDocumentRepository } from "../../domain/ports/KycDocumentRepository.js";
import type { KycApplicationStatus } from "../../domain/value-objects/KycApplicationStatus.js";

export interface GetMyApplicationInput {
  userId: string;
}

export interface MyApplicationView {
  id: string;
  status: KycApplicationStatus;
  submittedAt: Date | null;
  decidedAt: Date | null;
  rejectionReason: string | null;
  documents: KycDocument[];
}

export interface GetMyApplicationDeps {
  applications: KycApplicationRepository;
  documents: KycDocumentRepository;
}

export class GetMyApplicationQuery {
  constructor(private readonly deps: GetMyApplicationDeps) {}

  async execute(
    input: GetMyApplicationInput,
  ): Promise<Result<MyApplicationView, ApplicationNotFound>> {
    const application = await this.deps.applications.findByUserId(input.userId);
    if (application === null) return err(new ApplicationNotFound());
    const documents = await this.deps.documents.findByApplicationId(application.id);
    return ok({
      id: application.id,
      status: application.status,
      submittedAt: application.submittedAt,
      decidedAt: application.decidedAt,
      rejectionReason: application.rejectionReason,
      documents,
    });
  }
}
