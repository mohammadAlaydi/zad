import { type Result } from "@zadpay/errors";
import {
  AccountBalanceResponseSchema,
  AccountListResponseSchema,
  ExternalMovementResponseSchema,
  RecipientLookupResponseSchema,
  SendByPhoneResponseSchema,
  TransferResponseSchema,
  WalletTransactionListResponseSchema,
  type AccountBalanceResponse,
  type AccountListResponse,
  type ExternalMovementResponse,
  type RecipientLookupResponse,
  type SendByPhoneRequest,
  type SendByPhoneResponse,
  type TopupRequest,
  type TransferRequest,
  type TransferResponse,
  type WalletTransactionListResponse,
  type WithdrawalRequest,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

// Thin service-layer wrappers over PR-9/10/11 endpoints.
export const walletService = {
  // ── Queries ────────────────────────────────────────────────────────
  myAccounts(): Promise<Result<AccountListResponse, ClientError>> {
    return api.get<AccountListResponse>("/v1/wallet/accounts", AccountListResponseSchema);
  },

  accountBalance(accountId: string): Promise<Result<AccountBalanceResponse, ClientError>> {
    return api.get<AccountBalanceResponse>(
      `/v1/wallet/accounts/${accountId}/balance`,
      AccountBalanceResponseSchema,
    );
  },

  myTransactions(opts: {
    page: number;
    pageSize: number;
  }): Promise<Result<WalletTransactionListResponse, ClientError>> {
    return api.get<WalletTransactionListResponse>(
      `/v1/wallet/transactions?page=${String(opts.page)}&pageSize=${String(opts.pageSize)}`,
      WalletTransactionListResponseSchema,
    );
  },

  // ── Mutations (Idempotency-Key header required) ────────────────────
  send(
    input: TransferRequest,
    idempotencyKey: string,
  ): Promise<Result<TransferResponse, ClientError>> {
    return api.post<TransferResponse>("/v1/wallet/transfers", input, TransferResponseSchema, {
      idempotencyKey,
    });
  },

  sendByPhone(
    input: SendByPhoneRequest,
    idempotencyKey: string,
  ): Promise<Result<SendByPhoneResponse, ClientError>> {
    return api.post<SendByPhoneResponse>("/v1/wallet/send", input, SendByPhoneResponseSchema, {
      idempotencyKey,
    });
  },

  lookupByPhone(phone: string): Promise<Result<RecipientLookupResponse, ClientError>> {
    const q = encodeURIComponent(phone);
    return api.get<RecipientLookupResponse>(
      `/v1/identity/lookup?phone=${q}`,
      RecipientLookupResponseSchema,
    );
  },

  topup(
    input: TopupRequest,
    idempotencyKey: string,
  ): Promise<Result<ExternalMovementResponse, ClientError>> {
    return api.post<ExternalMovementResponse>(
      "/v1/wallet/topups",
      input,
      ExternalMovementResponseSchema,
      { idempotencyKey },
    );
  },

  withdraw(
    input: WithdrawalRequest,
    idempotencyKey: string,
  ): Promise<Result<ExternalMovementResponse, ClientError>> {
    return api.post<ExternalMovementResponse>(
      "/v1/wallet/withdrawals",
      input,
      ExternalMovementResponseSchema,
      { idempotencyKey },
    );
  },
};
