import type {
  TransferRequest,
  TransferResponse,
  WalletTransactionResponse,
} from "@zadpay/validation";
import { TransferRequestSchema } from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import { idempotency } from "../../../../shared/middleware/idempotency.js";
import type { CreateTransferCommand } from "../../application/commands/CreateTransfer.js";
import type { Transaction } from "../../domain/entities/Transaction.js";
import { ErrorResponseJson, TransferResponseJson } from "../schemas/wallet.js";

export interface TransferRouteDeps {
  createTransfer: CreateTransferCommand;
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

const TransferRequestJson = zodToJsonSchema(TransferRequestSchema, { target: "openApi3" });

export async function registerTransferRoutes(
  app: FastifyInstance,
  deps: TransferRouteDeps,
): Promise<void> {
  app.post<{ Body: TransferRequest }>(
    "/v1/wallet/transfers",
    {
      // idempotency runs AFTER requireAuth so the userId is in the request
      // context when the fingerprint is computed.
      preHandler: [requireAuth, idempotency],
      schema: {
        tags: ["wallet"],
        summary:
          "Transfer funds between two wallet accounts of the same currency. Requires an Idempotency-Key header.",
        security: [{ bearerAuth: [] }],
        body: TransferRequestJson,
        response: {
          200: TransferResponseJson,
          400: ErrorResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
          422: ErrorResponseJson,
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
      // Idempotency middleware guarantees the header is present + UUID.
      const idempotencyKey = req.idempotencyKey;
      if (idempotencyKey === undefined) {
        // Defensive — middleware should have already rejected this.
        await reply.status(400).send({
          code: "COMMON.VALIDATION",
          message: "Missing Idempotency-Key",
          requestId: req.id,
        });
        return;
      }

      const result = await deps.createTransfer.execute({
        userId,
        idempotencyKey,
        sourceAccountId: req.body.sourceAccountId,
        destAccountId: req.body.destAccountId,
        amount: {
          amount: BigInt(req.body.amount.amount),
          currency: req.body.amount.currency,
        },
        note: req.body.note,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const response: TransferResponse = { transaction: toResponse(result.value) };
      await reply.status(200).send(response);
    },
  );
}
