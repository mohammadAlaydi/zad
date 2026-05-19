// Zod request / response schemas for the KYC module. Consumed by both
// apps/api (route validation, OpenAPI) and apps/mobile (typed client +
// types inferred from these schemas).

import { z } from "zod";

export const KYC_APPLICATION_STATUSES = [
  "pending",
  "submitted",
  "review",
  "approved",
  "rejected",
] as const;
export type KycApplicationStatusValue = (typeof KYC_APPLICATION_STATUSES)[number];

export const KYC_DOCUMENT_TYPES = [
  "passport",
  "national_id",
  "driving_licence",
  "selfie",
  "proof_of_address",
] as const;
export type KycDocumentTypeValue = (typeof KYC_DOCUMENT_TYPES)[number];

export const KYC_DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export type KycDocumentMimeType = (typeof KYC_DOCUMENT_MIME_TYPES)[number];

// ── GET /v1/kyc/applications/me ────────────────────────────────────────
export const KycApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(KYC_APPLICATION_STATUSES),
  submittedAt: z.string().datetime().nullable(),
  decidedAt: z.string().datetime().nullable(),
  rejectionReason: z.string().nullable(),
  documents: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(KYC_DOCUMENT_TYPES),
      mimeType: z.enum(KYC_DOCUMENT_MIME_TYPES),
      status: z.string(),
      uploadedAt: z.string().datetime().nullable(),
    }),
  ),
});
export type KycApplicationResponse = z.infer<typeof KycApplicationResponseSchema>;

// ── POST /v1/kyc/applications/submit ───────────────────────────────────
// No body — userId comes from JWT. Response is the (now submitted) application.

// ── POST /v1/kyc/documents/presign ─────────────────────────────────────
export const PresignDocumentRequestSchema = z.object({
  type: z.enum(KYC_DOCUMENT_TYPES),
  mimeType: z.enum(KYC_DOCUMENT_MIME_TYPES),
});
export type PresignDocumentRequest = z.infer<typeof PresignDocumentRequestSchema>;

export const PresignDocumentResponseSchema = z.object({
  documentId: z.string().uuid(),
  uploadUrl: z.string().url(),
  s3Key: z.string(),
  expiresAt: z.string().datetime(),
  // Echo the constraints back so the client can show them in errors.
  maxSizeBytes: z.number().int().min(1),
});
export type PresignDocumentResponse = z.infer<typeof PresignDocumentResponseSchema>;
