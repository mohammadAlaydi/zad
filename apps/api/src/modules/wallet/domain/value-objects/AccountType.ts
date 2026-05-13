// Per ADR-0007: only `wallet` is user-facing; the others are internal
// accounting tools (reserves for pending captures, fee collection, an
// external_clearing book for funds in transit to/from processors).
export const ACCOUNT_TYPES = ["wallet", "reserve", "fee", "external_clearing"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_STATUSES = ["active", "frozen", "closed"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export function isAccountType(v: unknown): v is AccountType {
  return typeof v === "string" && (ACCOUNT_TYPES as readonly string[]).includes(v);
}
export function isAccountStatus(v: unknown): v is AccountStatus {
  return typeof v === "string" && (ACCOUNT_STATUSES as readonly string[]).includes(v);
}
