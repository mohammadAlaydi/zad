import { type Result } from "@zadpay/errors";
import {
  PayCheckoutRequestSchema,
  PayCheckoutResponseSchema,
  type PayCheckoutRequest,
  type PayCheckoutResponse,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

export const checkoutService = {
  async pay(
    input: PayCheckoutRequest,
    idempotencyKey: string,
  ): Promise<Result<PayCheckoutResponse, ClientError>> {
    PayCheckoutRequestSchema.parse(input);
    return api.post<PayCheckoutResponse>("/v1/checkout/pay", input, PayCheckoutResponseSchema, {
      idempotencyKey,
    });
  },
};
