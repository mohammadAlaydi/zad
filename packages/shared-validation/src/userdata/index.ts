// Schemas for the generic userdata module. The `payload` is an opaque
// object — per-feature shape lives in the mobile feature code, not here.

import { z } from "zod";

export const UserItemFeatureSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, "lowercase, digits, underscores; ≤40 chars");

export const UserItemPayloadSchema = z.record(z.unknown());
export type UserItemPayload = z.infer<typeof UserItemPayloadSchema>;

export const UserItemResponseSchema = z.object({
  id: z.string().uuid(),
  feature: UserItemFeatureSchema,
  payload: UserItemPayloadSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserItemResponse = z.infer<typeof UserItemResponseSchema>;

export const UserItemListResponseSchema = z.object({
  items: z.array(UserItemResponseSchema),
});
export type UserItemListResponse = z.infer<typeof UserItemListResponseSchema>;

export const CreateUserItemRequestSchema = z.object({
  payload: UserItemPayloadSchema,
});
export type CreateUserItemRequest = z.infer<typeof CreateUserItemRequestSchema>;

export const UpdateUserItemRequestSchema = z.object({
  payload: UserItemPayloadSchema,
});
export type UpdateUserItemRequest = z.infer<typeof UpdateUserItemRequestSchema>;
