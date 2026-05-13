// Application states per ADR-0008. Not the same as `User.kycStatus` in the
// identity module — that one's a coarse copy that flips on approval. The
// fine-grained state machine lives here.
export const KYC_APPLICATION_STATUSES = [
  "pending",
  "submitted",
  "review",
  "approved",
  "rejected",
] as const;

export type KycApplicationStatus = (typeof KYC_APPLICATION_STATUSES)[number];

export function isKycApplicationStatus(v: unknown): v is KycApplicationStatus {
  return typeof v === "string" && (KYC_APPLICATION_STATUSES as readonly string[]).includes(v);
}
