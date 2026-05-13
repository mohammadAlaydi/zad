// JSON-Schema versions of the Zod schemas for Fastify validation +
// OpenAPI doc generation.

import {
  KycApplicationResponseSchema,
  PresignDocumentRequestSchema,
  PresignDocumentResponseSchema,
} from "@zadpay/validation";
import { zodToJsonSchema } from "zod-to-json-schema";

const target = "openApi3" as const;

export const KycApplicationResponseJson = zodToJsonSchema(KycApplicationResponseSchema, { target });
export const PresignDocumentRequestJson = zodToJsonSchema(PresignDocumentRequestSchema, { target });
export const PresignDocumentResponseJson = zodToJsonSchema(PresignDocumentResponseSchema, {
  target,
});

export const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
    meta: { type: "object", additionalProperties: true },
  },
} as const;

export const NotifyDocumentUploadedRequestJson = {
  type: "object",
  required: ["sizeBytes"],
  properties: {
    sizeBytes: { type: "integer", minimum: 1, maximum: 50_000_000 },
  },
  additionalProperties: false,
} as const;
