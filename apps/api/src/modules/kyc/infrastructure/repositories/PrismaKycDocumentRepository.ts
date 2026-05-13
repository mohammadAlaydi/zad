import type { PrismaClient, KycDocument as PrismaKycDocument } from "@prisma/client";
import { KycDocument } from "../../domain/entities/KycDocument.js";
import type { KycDocumentRepository } from "../../domain/ports/KycDocumentRepository.js";
import {
  isAllowedMimeType,
  isDocumentStatus,
  isDocumentType,
  type AllowedMimeType,
  type DocumentStatus,
  type DocumentType,
} from "../../domain/value-objects/DocumentType.js";

function toDomain(row: PrismaKycDocument): KycDocument {
  // Fall back to safe defaults on bad data; the route layer validates inputs
  // so this only fires on legacy / hand-edited rows.
  const type: DocumentType = isDocumentType(row.type) ? row.type : "selfie";
  const mime: AllowedMimeType = isAllowedMimeType(row.mimeType) ? row.mimeType : "image/jpeg";
  const status: DocumentStatus = isDocumentStatus(row.status) ? row.status : "pending";
  return KycDocument.rehydrate({
    id: row.id,
    applicationId: row.applicationId,
    type,
    s3Key: row.s3Key,
    mimeType: mime,
    status,
    sizeBytes: row.sizeBytes,
    uploadedAt: row.uploadedAt,
    providerRef: row.providerRef,
    createdAt: row.createdAt,
  });
}

export class PrismaKycDocumentRepository implements KycDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<KycDocument | null> {
    const row = await this.prisma.kycDocument.findUnique({ where: { id } });
    return row === null ? null : toDomain(row);
  }

  async findByApplicationId(applicationId: string): Promise<KycDocument[]> {
    const rows = await this.prisma.kycDocument.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomain);
  }

  async countUploadedByApplicationId(applicationId: string): Promise<number> {
    return this.prisma.kycDocument.count({
      where: { applicationId, status: "uploaded" },
    });
  }

  async save(document: KycDocument): Promise<void> {
    await this.prisma.kycDocument.upsert({
      where: { id: document.id },
      create: {
        id: document.id,
        applicationId: document.applicationId,
        type: document.type,
        s3Key: document.s3Key,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedAt: document.uploadedAt,
        providerRef: document.providerRef,
        status: document.status,
      },
      update: {
        sizeBytes: document.sizeBytes,
        uploadedAt: document.uploadedAt,
        providerRef: document.providerRef,
        status: document.status,
      },
    });
  }
}
