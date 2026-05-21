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

// ── Inbox ──────────────────────────────────────────────────────────────
// Each notification row mirrors what the user saw on the lock screen,
// plus a structured `data` payload for deep linking. Data is open-ended
// (e.g. transactionId, ref) so the client can be forward-compatible.
export const InboxNotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.string().max(60),
  title: z.string(),
  body: z.string(),
  data: z.record(z.unknown()),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type InboxNotification = z.infer<typeof InboxNotificationSchema>;

export const InboxPageResponseSchema = z.object({
  items: z.array(InboxNotificationSchema),
  unreadCount: z.number().int().nonnegative(),
  nextCursor: z.string().datetime().nullable(),
});
export type InboxPageResponse = z.infer<typeof InboxPageResponseSchema>;

export const MarkAllReadResponseSchema = z.object({
  marked: z.number().int().nonnegative(),
});
export type MarkAllReadResponse = z.infer<typeof MarkAllReadResponseSchema>;

// ── Fraud reports ──────────────────────────────────────────────────────
// The app only ever creates these; ops / support reads them through
// internal tooling. `transactionId` is optional so the user can report
// something general (lost card, suspicious link, etc.).
export const FraudCategorySchema = z.enum(["unauthorized", "scam", "phishing", "other"]);
export type FraudCategory = z.infer<typeof FraudCategorySchema>;

export const SubmitFraudReportRequestSchema = z.object({
  transactionId: z.string().uuid().nullable().optional(),
  category: FraudCategorySchema,
  description: z.string().trim().min(10).max(2000),
});
export type SubmitFraudReportRequest = z.infer<typeof SubmitFraudReportRequestSchema>;

export const FraudReportResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  createdAt: z.string().datetime(),
});
export type FraudReportResponse = z.infer<typeof FraudReportResponseSchema>;
