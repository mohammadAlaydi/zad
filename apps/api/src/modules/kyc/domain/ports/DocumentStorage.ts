// Storage abstraction for KYC document uploads (ADR-0008). The mobile app
// uploads directly to the returned `uploadUrl` — origin servers never
// touch document bytes. In dev: InMemoryDocumentStorage returns a stub URL.
// In production: AwsS3DocumentStorage returns a real presigned PUT URL.

import type { AllowedMimeType, DocumentType } from "../value-objects/DocumentType.js";

export interface PresignUploadInput {
  applicationId: string;
  documentId: string;
  type: DocumentType;
  mimeType: AllowedMimeType;
}

export interface PresignedUpload {
  uploadUrl: string;
  s3Key: string;
  expiresAt: Date;
  maxSizeBytes: number;
}

export interface DocumentStorage {
  presignUpload(input: PresignUploadInput): Promise<PresignedUpload>;
}
