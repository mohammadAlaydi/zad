// Zod request schemas for the notifications module. Consumed by both the
// API (route validation, OpenAPI) and the mobile client (typed payloads).

import { z } from "zod";

export const RegisterPushTokenRequestSchema = z.object({
  token: z.string().min(1).max(2048),
  platform: z.enum(["ios", "android", "web"]),
  deviceName: z.string().max(120).nullable().optional(),
});
export type RegisterPushTokenRequest = z.infer<typeof RegisterPushTokenRequestSchema>;

export const UnregisterPushTokenRequestSchema = z.object({
  token: z.string().min(1).max(2048),
});
export type UnregisterPushTokenRequest = z.infer<typeof UnregisterPushTokenRequestSchema>;
