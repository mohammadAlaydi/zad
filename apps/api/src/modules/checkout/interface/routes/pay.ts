import {
  PayCheckoutRequestSchema,
  PayCheckoutResponseSchema,
  type PayCheckoutRequest,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import { idempotency } from "../../../../shared/middleware/idempotency.js";
import type { PayCheckoutCommand } from "../../application/commands/PayCheckout.js";

export interface PayRouteDeps {
  pay: PayCheckoutCommand;
}

const target = "openApi3" as const;
const PayCheckoutRequestJson = zodToJsonSchema(PayCheckoutRequestSchema, { target });
const PayCheckoutResponseJson = zodToJsonSchema(PayCheckoutResponseSchema, { target });

const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
  },
} as const;

export async function registerPayRoutes(app: FastifyInstance, deps: PayRouteDeps): Promise<void> {
  app.post<{ Body: PayCheckoutRequest }>(
    "/v1/checkout/pay",
    {
      // Same idempotency middleware the wallet routes use — guarantees a
      // UUID header is present and fingerprints the body, so a retried
      // tap with the same Idempotency-Key returns the original result
      // even if the original response was dropped.
      preHandler: [requireAuth, idempotency],
      schema: {
        tags: ["checkout"],
        summary:
          "Pay for a cart of items. Resolves the merchant by phone, debits the caller's wallet, credits the merchant's wallet. Requires Idempotency-Key.",
        security: [{ bearerAuth: [] }],
        body: PayCheckoutRequestJson,
        response: {
          200: PayCheckoutResponseJson,
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
      const idempotencyKey = req.idempotencyKey;
      if (idempotencyKey === undefined) {
        await reply.status(400).send({
          code: "COMMON.VALIDATION",
          message: "Missing Idempotency-Key",
          requestId: req.id,
        });
        return;
      }

      const result = await deps.pay.execute({
        customerId: userId,
        merchantPhone: req.body.merchantPhone,
        items: req.body.items.map((i) => ({
          id: i.id,
          name: i.name,
          priceMinor: BigInt(i.priceMinor),
          quantity: i.quantity,
        })),
        totalMinor: BigInt(req.body.totalMinor),
        currency: req.body.currency,
        idempotencyKey,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({
        orderId: result.value.orderId,
        status: result.value.status,
        transactionId: result.value.transactionId,
        merchantName: result.value.merchantName,
      });
    },
  );
}
