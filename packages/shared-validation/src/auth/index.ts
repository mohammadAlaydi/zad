// Zod request / response schemas for the identity module. Consumed by:
//   • apps/api (route validation, OpenAPI generation)
//   • apps/mobile (typed API client — types inferred from these schemas)

import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { z } from "zod";

// ── Phone (E.164) ────────────────────────────────────────────────────
// Strict format: `+<country code><national number>`. Per-country validity
// (correct length for IQ vs EG, etc.) is enforced via `phoneMatchesCountry`
// on schemas that carry both `phone` and `country`.
export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,15}$/, "Phone must be in E.164 format, e.g. +9647712345678");

// ── Country (ISO-3166-1 alpha-2) ─────────────────────────────────────
export const CountrySchema = z
  .string()
  .trim()
  .length(2)
  .regex(/^[A-Z]{2}$/, "Country must be a 2-letter ISO code");

function phoneMatchesCountry(value: { phone: string; country: string }): boolean {
  const parsed = parsePhoneNumberFromString(value.phone, value.country as CountryCode);
  return parsed !== undefined && parsed.isValid() && parsed.country === value.country;
}

const phoneCountryRefinement = {
  message: "Phone number is not valid for the selected country",
  path: ["phone"] as ["phone"],
};

// ── Login ──────────────────────────────────────────────────────────────
export const LoginRequestSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ── Phone login ────────────────────────────────────────────────────────
// Used by accounts created via the phone-first signup (no email on file).
export const LoginByPhoneRequestSchema = z
  .object({
    phone: PhoneSchema,
    country: CountrySchema,
    password: z.string().min(8).max(256),
  })
  .refine(phoneMatchesCountry, phoneCountryRefinement);
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
export const RegisterRequestSchema = z
  .object({
    email: z.string().email().max(254).optional(),
    password: z.string().min(8).max(256),
    phone: PhoneSchema,
    country: CountrySchema,
    fullName: z.string().trim().min(2).max(120),
  })
  .refine(phoneMatchesCountry, phoneCountryRefinement);
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
