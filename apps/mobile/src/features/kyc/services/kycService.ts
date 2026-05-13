import { type Result } from "@zadpay/errors";
import {
  KycApplicationResponseSchema,
  PresignDocumentRequestSchema,
  PresignDocumentResponseSchema,
  type KycApplicationResponse,
  type PresignDocumentRequest,
  type PresignDocumentResponse,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

// Thin service-layer wrappers over PR-6's /v1/kyc/* endpoints.
export const kycService = {
  async ensure(): Promise<Result<KycApplicationResponse, ClientError>> {
    return api.post<KycApplicationResponse>(
      "/v1/kyc/applications",
      undefined,
      KycApplicationResponseSchema,
    );
  },

  async getMine(): Promise<Result<KycApplicationResponse, ClientError>> {
    return api.get<KycApplicationResponse>("/v1/kyc/applications/me", KycApplicationResponseSchema);
  },

  async submit(): Promise<Result<KycApplicationResponse, ClientError>> {
    return api.post<KycApplicationResponse>(
      "/v1/kyc/applications/submit",
      undefined,
      KycApplicationResponseSchema,
    );
  },

  async presignDocument(
    input: PresignDocumentRequest,
  ): Promise<Result<PresignDocumentResponse, ClientError>> {
    PresignDocumentRequestSchema.parse(input);
    return api.post<PresignDocumentResponse>(
      "/v1/kyc/documents/presign",
      input,
      PresignDocumentResponseSchema,
    );
  },

  async notifyUploaded(documentId: string, sizeBytes: number): Promise<Result<void, ClientError>> {
    return api.postVoid(`/v1/kyc/documents/${documentId}/notify`, { sizeBytes });
  },
};
