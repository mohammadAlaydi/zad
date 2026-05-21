import {
  FraudReportResponseSchema,
  SubmitFraudReportRequestSchema,
  type SubmitFraudReportRequest,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type { SubmitFraudReportCommand } from "../../application/SubmitFraudReport.js";

export interface FraudRouteDeps {
  submit: SubmitFraudReportCommand;
}

const target = "openApi3" as const;
const SubmitFraudReportRequestJson = zodToJsonSchema(SubmitFraudReportRequestSchema, { target });
const FraudReportResponseJson = zodToJsonSchema(FraudReportResponseSchema, { target });

const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
  },
} as const;

export async function registerFraudRoutes(
  app: FastifyInstance,
  deps: FraudRouteDeps,
): Promise<void> {
  app.post<{ Body: SubmitFraudReportRequest }>(
    "/v1/fraud-reports",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary: "Submit a fraud report for the caller. Always creates a new row.",
        security: [{ bearerAuth: [] }],
        body: SubmitFraudReportRequestJson,
        response: { 201: FraudReportResponseJson, 401: ErrorResponseJson },
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
      const result = await deps.submit.execute({
        userId,
        transactionId: req.body.transactionId ?? null,
        category: req.body.category,
        description: req.body.description,
      });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to submit report",
          requestId: req.id,
        });
        return;
      }
      await reply.status(201).send({
        id: result.value.id,
        status: result.value.status,
        createdAt: result.value.createdAt.toISOString(),
      });
    },
  );
}
