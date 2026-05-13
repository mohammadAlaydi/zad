import type { KycDocument } from "../entities/KycDocument.js";

export interface KycDocumentRepository {
  findById(id: string): Promise<KycDocument | null>;
  findByApplicationId(applicationId: string): Promise<KycDocument[]>;
  countUploadedByApplicationId(applicationId: string): Promise<number>;
  save(document: KycDocument): Promise<void>;
}
