// Zod request / response schemas for the identity module. Consumed by:
//   • apps/api (route validation, OpenAPI generation)
//   • apps/mobile (typed API client — types inferred from these schemas)

import { z } from "zod";

// ── Login ──────────────────────────────────────────────────────────────
export const LoginRequestSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

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
export const RegisterRequestSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ── Token pair response (login / refresh / register) ───────────────────
export const TokenPairResponseSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.string().datetime(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.string().datetime(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    kycStatus: z.enum(["not_started", "pending", "submitted", "review", "approved", "rejected"]),
    roles: z.array(z.string()),
  }),
});
export type TokenPairResponse = z.infer<typeof TokenPairResponseSchema>;

// ── /v1/identity/me response ───────────────────────────────────────────
export const MeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  kycStatus: z.enum(["not_started", "pending", "submitted", "review", "approved", "rejected"]),
  roles: z.array(z.string()),
  createdAt: z.string().datetime(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;
