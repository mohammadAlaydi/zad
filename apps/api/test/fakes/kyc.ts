// In-memory test doubles for the KYC module's ports.

import { type KycApplication } from "../../src/modules/kyc/domain/entities/KycApplication.js";
import { type KycDocument } from "../../src/modules/kyc/domain/entities/KycDocument.js";
import type { Clock } from "../../src/modules/kyc/domain/ports/Clock.js";
import type {
  DocumentStorage,
  PresignUploadInput,
  PresignedUpload,
} from "../../src/modules/kyc/domain/ports/DocumentStorage.js";
import type { IdGenerator } from "../../src/modules/kyc/domain/ports/IdGenerator.js";
import type { KycApplicationRepository } from "../../src/modules/kyc/domain/ports/KycApplicationRepository.js";
import type { KycDocumentRepository } from "../../src/modules/kyc/domain/ports/KycDocumentRepository.js";
import type { KycProvider } from "../../src/modules/kyc/domain/ports/KycProvider.js";

export class InMemoryKycApplicationRepository implements KycApplicationRepository {
  private readonly byId = new Map<string, KycApplication>();
  private readonly byUserId = new Map<string, KycApplication>();

  async findById(id: string): Promise<KycApplication | null> {
    return this.byId.get(id) ?? null;
  }
  async findByUserId(userId: string): Promise<KycApplication | null> {
    return this.byUserId.get(userId) ?? null;
  }
  async save(application: KycApplication): Promise<void> {
    this.byId.set(application.id, application);
    this.byUserId.set(application.userId, application);
  }
}

export class InMemoryKycDocumentRepository implements KycDocumentRepository {
  private readonly byId = new Map<string, KycDocument>();

  async findById(id: string): Promise<KycDocument | null> {
    return this.byId.get(id) ?? null;
  }
  async findByApplicationId(applicationId: string): Promise<KycDocument[]> {
    return [...this.byId.values()].filter((d) => d.applicationId === applicationId);
  }
  async countUploadedByApplicationId(applicationId: string): Promise<number> {
    return [...this.byId.values()].filter(
      (d) => d.applicationId === applicationId && d.status === "uploaded",
    ).length;
  }
  async save(document: KycDocument): Promise<void> {
    this.byId.set(document.id, document);
  }
}

export class FakeKycProvider implements KycProvider {
  readonly submitted: string[] = [];
  async submitForReview(applicationId: string): Promise<void> {
    this.submitted.push(applicationId);
  }
}

export class FakeDocumentStorage implements DocumentStorage {
  async presignUpload(input: PresignUploadInput): Promise<PresignedUpload> {
    return {
      uploadUrl: `https://fake.test/upload/${input.documentId}`,
      s3Key: `kyc/${input.applicationId}/${input.documentId}`,
      expiresAt: new Date(Date.now() + 300_000),
      maxSizeBytes: 8 * 1024 * 1024,
    };
  }
}

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return new Date(this.current.getTime());
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  uuid(): string {
    this.counter += 1;
    return `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`;
  }
}
