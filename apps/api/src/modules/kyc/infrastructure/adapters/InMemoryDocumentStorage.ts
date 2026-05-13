import type {
  DocumentStorage,
  PresignUploadInput,
  PresignedUpload,
} from "../../domain/ports/DocumentStorage.js";

// Dev / test storage. Returns a placeholder URL — the mobile app's upload
// PUT will 404, and the `notify` endpoint lets the demo proceed by faking
// the upload step. AwsS3DocumentStorage replaces this in production.
export class InMemoryDocumentStorage implements DocumentStorage {
  private readonly baseUrl: string;
  private readonly ttlSeconds: number;
  private readonly maxSizeBytes: number;

  constructor(opts: { baseUrl: string; ttlSeconds?: number; maxSizeBytes?: number }) {
    this.baseUrl = opts.baseUrl;
    this.ttlSeconds = opts.ttlSeconds ?? 300; // 5 min
    this.maxSizeBytes = opts.maxSizeBytes ?? 8 * 1024 * 1024; // 8 MB
  }

  async presignUpload(input: PresignUploadInput): Promise<PresignedUpload> {
    const s3Key = `kyc/${input.applicationId}/${input.documentId}-${input.type}`;
    return {
      uploadUrl: `${this.baseUrl}/_dev/kyc-upload/${input.documentId}`,
      s3Key,
      expiresAt: new Date(Date.now() + this.ttlSeconds * 1000),
      maxSizeBytes: this.maxSizeBytes,
    };
  }
}
