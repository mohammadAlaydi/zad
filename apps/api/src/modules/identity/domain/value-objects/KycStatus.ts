export const KYC_STATUSES = [
  "not_started",
  "pending",
  "submitted",
  "review",
  "approved",
  "rejected",
] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export function isKycStatus(v: unknown): v is KycStatus {
  return typeof v === "string" && (KYC_STATUSES as readonly string[]).includes(v);
}
