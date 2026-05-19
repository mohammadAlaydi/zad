// POST /v1/wallet/topups + /v1/wallet/withdrawals. Same idempotency +
// auth handling as transfers.

import type {
  ExternalMovementResponse,
  TopupRequest,
  WalletTransactionResponse,
  WithdrawalRequest,
} from "@zadpay/validation";
import { TopupRequestSchema, WithdrawalRequestSchema } from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import { idempotency } from "../../../../shared/middleware/idempotency.js";
import type { CreateTopupCommand } from "../../application/commands/CreateTopup.js";
import type { CreateWithdrawalCommand } from "../../application/commands/CreateWithdrawal.js";
import type { Transaction } from "../../domain/entities/Transaction.js";
import { ErrorResponseJson, ExternalMovementResponseJson } from "../schemas/wallet.js";

export interface ExternalRouteDeps {
  createTopup: CreateTopupCommand;
  createWithdrawal: CreateWithdrawalCommand;
}

function toResponse(tx: Transaction): WalletTransactionResponse {
  return {
    id: tx.id,
    type: tx.type,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
    postedAt: tx.postedAt?.toISOString() ?? null,
    entries: tx.entries.map((e) => ({
      accountId: e.accountId,
      direction: e.direction,
      amount: e.amount.toString(),
      currency: e.currency,
    })),
  };
}

const TopupRequestJson = zodToJsonSchema(TopupRequestSchema, { target: "openApi3" });
const WithdrawalRequestJson = zodToJsonSchema(WithdrawalRequestSchema, { target: "openApi3" });

export async function registerExternalRoutes(
  app: FastifyInstance,
  deps: ExternalRouteDeps,
): Promise<void> {
  app.post<{ Body: TopupRequest }>(
    "/v1/wallet/topups",
    {
      preHandler: [requireAuth, idempotency],
      schema: {
        tags: ["wallet"],
        summary: "Top up a wallet from an external source. Requires Idempotency-Key.",
        security: [{ bearerAuth: [] }],
        body: TopupRequestJson,
        response: {
          200: ExternalMovementResponseJson,
          400: ErrorResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
          422: ErrorResponseJson,
        },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      const idempotencyKey = req.idempotencyKey;
      if (userId === undefined || idempotencyKey === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.createTopup.execute({
        userId,
        idempotencyKey,
        accountId: req.body.accountId,
        amount: {
          amount: BigInt(req.body.amount.amount),
          currency: req.body.amount.currency,
        },
        source: req.body.source,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const response: ExternalMovementResponse = { transaction: toResponse(result.value) };
      await reply.status(200).send(response);
    },
  );

  app.post<{ Body: WithdrawalRequest }>(
    "/v1/wallet/withdrawals",
    {
      preHandler: [requireAuth, idempotency],
      schema: {
        tags: ["wallet"],
        summary: "Withdraw from a wallet to an external destination. Requires Idempotency-Key.",
        security: [{ bearerAuth: [] }],
        body: WithdrawalRequestJson,
        response: {
          200: ExternalMovementResponseJson,
          400: ErrorResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
          422: ErrorResponseJson,
        },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      const idempotencyKey = req.idempotencyKey;
      if (userId === undefined || idempotencyKey === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.createWithdrawal.execute({
        userId,
        idempotencyKey,
        accountId: req.body.accountId,
        amount: {
          amount: BigInt(req.body.amount.amount),
          currency: req.body.amount.currency,
        },
        destination: req.body.destination,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const response: ExternalMovementResponse = { transaction: toResponse(result.value) };
      await reply.status(200).send(response);
    },
  );
}
