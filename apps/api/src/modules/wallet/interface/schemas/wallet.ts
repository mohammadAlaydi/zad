import {
  AccountBalanceResponseSchema,
  AccountListResponseSchema,
  ExternalMovementResponseSchema,
  SendByPhoneResponseSchema,
  TransferResponseSchema,
  WalletTransactionListResponseSchema,
} from "@zadpay/validation";
import { zodToJsonSchema } from "zod-to-json-schema";

const target = "openApi3" as const;

export const AccountListResponseJson = zodToJsonSchema(AccountListResponseSchema, { target });
export const AccountBalanceResponseJson = zodToJsonSchema(AccountBalanceResponseSchema, { target });
export const WalletTransactionListResponseJson = zodToJsonSchema(
  WalletTransactionListResponseSchema,
  { target },
);
export const TransferResponseJson = zodToJsonSchema(TransferResponseSchema, { target });
export const SendByPhoneResponseJson = zodToJsonSchema(SendByPhoneResponseSchema, { target });
export const ExternalMovementResponseJson = zodToJsonSchema(ExternalMovementResponseSchema, {
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
