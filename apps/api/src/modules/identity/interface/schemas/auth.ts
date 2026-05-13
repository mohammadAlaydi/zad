// Re-export the shared Zod schemas + provide JSON-Schema versions for
// Fastify's built-in validator. zod-to-json-schema converts at module-load
// so there's no per-request cost.

import {
  LoginRequestSchema,
  LogoutRequestSchema,
  MeResponseSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
  TokenPairResponseSchema,
} from "@zadpay/validation/auth";
import { zodToJsonSchema } from "zod-to-json-schema";

const target = "openApi3" as const;

export const LoginRequestJson = zodToJsonSchema(LoginRequestSchema, { target });
export const RefreshRequestJson = zodToJsonSchema(RefreshRequestSchema, { target });
export const LogoutRequestJson = zodToJsonSchema(LogoutRequestSchema, { target });
export const RegisterRequestJson = zodToJsonSchema(RegisterRequestSchema, { target });
export const TokenPairResponseJson = zodToJsonSchema(TokenPairResponseSchema, { target });
export const MeResponseJson = zodToJsonSchema(MeResponseSchema, { target });

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
