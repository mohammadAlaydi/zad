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
