export const TRANSACTION_TYPES = [
  "transfer",
  "topup",
  "withdrawal",
  "fee",
  "reversal",
  "adjustment",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["pending", "posted", "reversed"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const LEDGER_DIRECTIONS = ["debit", "credit"] as const;
export type LedgerDirection = (typeof LEDGER_DIRECTIONS)[number];

export function isTransactionType(v: unknown): v is TransactionType {
  return typeof v === "string" && (TRANSACTION_TYPES as readonly string[]).includes(v);
}
export function isTransactionStatus(v: unknown): v is TransactionStatus {
  return typeof v === "string" && (TRANSACTION_STATUSES as readonly string[]).includes(v);
}
export function isLedgerDirection(v: unknown): v is LedgerDirection {
  return typeof v === "string" && (LEDGER_DIRECTIONS as readonly string[]).includes(v);
}
