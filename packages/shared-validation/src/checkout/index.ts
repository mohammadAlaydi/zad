// Zod request / response schemas for the checkout module. Consumed by
// both apps/api (route validation, OpenAPI) and apps/mobile (typed
// client, types inferred from these schemas).

import { CURRENCIES } from "@zadpay/types";
import { z } from "zod";

const CurrencyEnum = z.enum(CURRENCIES);

export const CheckoutItemSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  // Money as stringified int64 (minor units) for precision over JSON.
  priceMinor: z.string().regex(/^\d+$/, "priceMinor must be a non-negative integer string"),
  quantity: z.number().int().positive().max(1000),
});
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const PayCheckoutRequestSchema = z.object({
  merchantPhone: z.string().min(1).max(32),
  items: z.array(CheckoutItemSchema).min(1).max(100),
  totalMinor: z.string().regex(/^\d+$/, "totalMinor must be a non-negative integer string"),
  currency: CurrencyEnum,
});
export type PayCheckoutRequest = z.infer<typeof PayCheckoutRequestSchema>;

export const PayCheckoutResponseSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["paid"]),
  transactionId: z.string().uuid(),
  merchantName: z.string(),
});
export type PayCheckoutResponse = z.infer<typeof PayCheckoutResponseSchema>;
