// Zod request / response schemas for the identity module. Consumed by:
//   • apps/api (route validation, OpenAPI generation)
//   • apps/mobile (typed API client — types inferred from these schemas)

import { z } from "zod";

// ── Phone (permissive) ────────────────────────────────────────────────
// Intentionally relaxed for dev: accept any non-empty string the user
// types. We'll tighten to strict E.164 once the signup/SMS verification
// flow is wired. The string is used as a unique identifier in the DB —
// equality has to match exactly, so the same value must be used at
// signup and at send time.
export const PhoneSchema = z.string().trim().min(1).max(32);

// ── Login ──────────────────────────────────────────────────────────────
export const LoginRequestSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ── Phone login ────────────────────────────────────────────────────────
// Used by accounts created via the phone-first signup (no email on file).
// Phone is permissive — see PhoneSchema for the rationale.
export const LoginByPhoneRequestSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(8).max(256),
});
export type LoginByPhoneRequest = z.infer<typeof LoginByPhoneRequestSchema>;

// ── Refresh ────────────────────────────────────────────────────────────
export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1).max(2048),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

// ── Logout ─────────────────────────────────────────────────────────────
export const LogoutRequestSchema = z.object({
  refreshToken: z.string().min(1).max(2048),
});
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

// ── Register ───────────────────────────────────────────────────────────
// Email is optional — users register with phone + name + password and can
// add an email later from settings.
export const RegisterRequestSchema = z.object({
  email: z.string().email().max(254).optional(),
  password: z.string().min(8).max(256),
  phone: PhoneSchema,
  fullName: z.string().trim().min(2).max(120),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ── Change password ────────────────────────────────────────────────────
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(8).max(256),
});
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// ── Recipient lookup by phone ──────────────────────────────────────────
export const RecipientLookupResponseSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  phone: z.string(),
  accountId: z.string().uuid(),
  currency: z.string().length(3),
});
export type RecipientLookupResponse = z.infer<typeof RecipientLookupResponseSchema>;

// ── Token pair response (login / refresh / register) ───────────────────
export const TokenPairResponseSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.string().datetime(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.string().datetime(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    fullName: z.string().nullable(),
    kycStatus: z.enum(["not_started", "pending", "submitted", "review", "approved", "rejected"]),
    roles: z.array(z.string()),
  }),
});
export type TokenPairResponse = z.infer<typeof TokenPairResponseSchema>;

// ── /v1/identity/me response ───────────────────────────────────────────
export const MeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  fullName: z.string().nullable(),
  kycStatus: z.enum(["not_started", "pending", "submitted", "review", "approved", "rejected"]),
  roles: z.array(z.string()),
  createdAt: z.string().datetime(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

// ── PATCH /v1/identity/me request ──────────────────────────────────────
// Only fields the user can edit themselves are listed here. Email + phone
// changes require a separate verification flow and are intentionally
// excluded — they're set at signup and only changed via a re-verification
// endpoint (out of Phase 1 scope).
export const UpdateMeRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
});
export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;

// ── /v1/identity/sessions ──────────────────────────────────────────────
// Each row = one logged-in device (active refresh token). The `family`
// field groups rotated tokens — clients can hide it; it's exposed for
// debugging / future "this is your current device" UI.
export const SessionSchema = z.object({
  id: z.string().uuid(),
  family: z.string().uuid(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type Session = z.infer<typeof SessionSchema>;

export const SessionListResponseSchema = z.object({
  sessions: z.array(SessionSchema),
});
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;

export const RevokeAllSessionsResponseSchema = z.object({
  revoked: z.number().int().nonnegative(),
});
export type RevokeAllSessionsResponse = z.infer<typeof RevokeAllSessionsResponseSchema>;
