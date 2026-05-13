export const DOCUMENT_TYPES = [
  "passport",
  "national_id",
  "driving_licence",
  "selfie",
  "proof_of_address",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const DOCUMENT_STATUSES = [
  "pending",
  "uploaded",
  "submitted",
  "accepted",
  "rejected",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export function isDocumentType(v: unknown): v is DocumentType {
  return typeof v === "string" && (DOCUMENT_TYPES as readonly string[]).includes(v);
}
export function isAllowedMimeType(v: unknown): v is AllowedMimeType {
  return typeof v === "string" && (ALLOWED_MIME_TYPES as readonly string[]).includes(v);
}
export function isDocumentStatus(v: unknown): v is DocumentStatus {
  return typeof v === "string" && (DOCUMENT_STATUSES as readonly string[]).includes(v);
}
