import type {
  AccountListResponse,
  AccountBalanceResponse,
  WalletTransactionListResponse,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type { GetAccountBalanceQuery } from "../../application/queries/GetAccountBalance.js";
import type { GetMyAccountsQuery } from "../../application/queries/GetMyAccounts.js";
import type { ListMyTransactionsQuery } from "../../application/queries/ListMyTransactions.js";
import {
  AccountBalanceResponseJson,
  AccountListResponseJson,
  ErrorResponseJson,
  WalletTransactionListResponseJson,
} from "../schemas/wallet.js";

export interface WalletRouteDeps {
  myAccounts: GetMyAccountsQuery;
  accountBalance: GetAccountBalanceQuery;
  myTransactions: ListMyTransactionsQuery;
}

export async function registerWalletRoutes(
  app: FastifyInstance,
  deps: WalletRouteDeps,
): Promise<void> {
  app.get(
    "/v1/wallet/accounts",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["wallet"],
        summary: "List the caller's wallet accounts.",
        security: [{ bearerAuth: [] }],
        response: { 200: AccountListResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.myAccounts.execute({ userId });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to load accounts",
          requestId: req.id,
        });
        return;
      }
      const response: AccountListResponse = {
        accounts: result.value.map((a) => ({
          id: a.id,
          currency: a.currency,
          type: a.type,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
      };
      await reply.status(200).send(response);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/v1/wallet/accounts/:id/balance",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["wallet"],
        summary: "Get the balance of one of the caller's accounts.",
        security: [{ bearerAuth: [] }],
        response: {
          200: AccountBalanceResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
        },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.accountBalance.execute({ userId, accountId: req.params.id });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const response: AccountBalanceResponse = {
        accountId: result.value.accountId,
        balance: {
          amount: result.value.balance.amount.toString(),
          currency: result.value.balance.currency,
        },
        updatedAt: result.value.updatedAt?.toISOString() ?? null,
      };
      await reply.status(200).send(response);
    },
  );

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/v1/wallet/transactions",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["wallet"],
        summary: "List the caller's transactions, newest first.",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "string", pattern: "^\\d+$" },
            pageSize: { type: "string", pattern: "^\\d+$" },
          },
        },
        response: {
          200: WalletTransactionListResponseJson,
          401: ErrorResponseJson,
        },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const page = req.query.page === undefined ? 0 : Number.parseInt(req.query.page, 10);
      const pageSize =
        req.query.pageSize === undefined ? 50 : Number.parseInt(req.query.pageSize, 10);
      const result = await deps.myTransactions.execute({ userId, page, pageSize });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to load transactions",
          requestId: req.id,
        });
        return;
      }
      const response: WalletTransactionListResponse = {
        transactions: result.value.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          postedAt: t.postedAt?.toISOString() ?? null,
          entries: t.entries.map((e) => ({
            accountId: e.accountId,
            direction: e.direction,
            amount: e.amount.toString(),
            currency: e.currency,
          })),
        })),
        page: result.value.page,
        pageSize: result.value.pageSize,
        total: result.value.total,
      };
      await reply.status(200).send(response);
    },
  );
}
