// Zod request / response schemas for the wallet module. Consumed by both
// apps/api (route validation, OpenAPI) and apps/mobile (typed client +
// types inferred from these schemas).

import { CURRENCIES } from "@zadpay/types";
import { z } from "zod";

const CurrencyEnum = z.enum(CURRENCIES);

// `Money` over JSON: amount as string (bigint loses precision in number
// JSON) + currency. Mirrors @zadpay/types/Money.toJSON.
export const MoneyJsonSchema = z.object({
  amount: z.string().regex(/^-?\d+$/, "Money amount must be an integer string"),
  currency: CurrencyEnum,
});
export type MoneyJson = z.infer<typeof MoneyJsonSchema>;

// ── GET /v1/wallet/accounts ────────────────────────────────────────────
export const AccountResponseSchema = z.object({
  id: z.string().uuid(),
  currency: CurrencyEnum,
  type: z.enum(["wallet", "reserve", "fee", "external_clearing"]),
  status: z.enum(["active", "frozen", "closed"]),
  createdAt: z.string().datetime(),
});
export type AccountResponse = z.infer<typeof AccountResponseSchema>;

export const AccountListResponseSchema = z.object({
  accounts: z.array(AccountResponseSchema),
});
export type AccountListResponse = z.infer<typeof AccountListResponseSchema>;

// ── GET /v1/wallet/accounts/:id/balance ────────────────────────────────
export const AccountBalanceResponseSchema = z.object({
  accountId: z.string().uuid(),
  balance: MoneyJsonSchema,
  updatedAt: z.string().datetime().nullable(),
});
export type AccountBalanceResponse = z.infer<typeof AccountBalanceResponseSchema>;

// ── GET /v1/wallet/transactions ────────────────────────────────────────
export const WalletTransactionEntrySchema = z.object({
  accountId: z.string().uuid(),
  direction: z.enum(["debit", "credit"]),
  amount: z.string().regex(/^-?\d+$/),
  currency: CurrencyEnum,
});

export const WalletTransactionResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["transfer", "topup", "withdrawal", "fee", "reversal", "adjustment"]),
  status: z.enum(["pending", "posted", "reversed"]),
  createdAt: z.string().datetime(),
  postedAt: z.string().datetime().nullable(),
  entries: z.array(WalletTransactionEntrySchema),
});
export type WalletTransactionResponse = z.infer<typeof WalletTransactionResponseSchema>;

export const WalletTransactionListResponseSchema = z.object({
  transactions: z.array(WalletTransactionResponseSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type WalletTransactionListResponse = z.infer<typeof WalletTransactionListResponseSchema>;

// ── POST /v1/wallet/transfers ──────────────────────────────────────────
// Sender + amount + receiver. Receiver is identified by accountId for
// PR-10; PR-future adds receiver-by-phone / receiver-by-username flows.
export const TransferRequestSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destAccountId: z.string().uuid(),
  amount: MoneyJsonSchema,
  note: z.string().max(280).optional(),
});
export type TransferRequest = z.infer<typeof TransferRequestSchema>;

// Response is the posted transaction (same shape as listing entries).
export const TransferResponseSchema = z.object({
  transaction: WalletTransactionResponseSchema,
});
export type TransferResponse = z.infer<typeof TransferResponseSchema>;

// ── POST /v1/wallet/topups ─────────────────────────────────────────────
// `source` is an opaque token from the processor SDK (e.g. Stripe token,
// network-tokenized PAN). The api never sees raw card data — PCI ADR.
// In dev with InMemoryPaymentProcessor, any non-empty string works.
export const TopupRequestSchema = z.object({
  accountId: z.string().uuid(),
  amount: MoneyJsonSchema,
  source: z.string().min(1).max(200),
});
export type TopupRequest = z.infer<typeof TopupRequestSchema>;

// ── POST /v1/wallet/withdrawals ────────────────────────────────────────
export const WithdrawalRequestSchema = z.object({
  accountId: z.string().uuid(),
  amount: MoneyJsonSchema,
  destination: z.string().min(1).max(200),
});
export type WithdrawalRequest = z.infer<typeof WithdrawalRequestSchema>;

// Both endpoints return the same shape as Transfer.
export const ExternalMovementResponseSchema = z.object({
  transaction: WalletTransactionResponseSchema,
});
export type ExternalMovementResponse = z.infer<typeof ExternalMovementResponseSchema>;
