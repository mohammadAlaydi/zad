import {
  LoginByPhoneRequestSchema,
  RegisterRequestSchema,
  type LoginByPhoneRequest,
  type LoginRequest,
  type LogoutRequest,
  type RefreshRequest,
  type RegisterRequest,
  type TokenPairResponse,
} from "@zadpay/validation/auth";
import type { FastifyInstance } from "fastify";
import type { LoginCommand } from "../../application/commands/Login.js";
import type { LoginByPhoneCommand } from "../../application/commands/LoginByPhone.js";
import type { LogoutCommand } from "../../application/commands/Logout.js";
import type { RefreshCommand } from "../../application/commands/Refresh.js";
import type { RegisterCommand } from "../../application/commands/Register.js";
import type { IssueTokensResult } from "../../application/commands/shared/issueTokens.js";
import {
  ErrorResponseJson,
  LoginByPhoneRequestJson,
  LoginRequestJson,
  LogoutRequestJson,
  RefreshRequestJson,
  RegisterRequestJson,
  TokenPairResponseJson,
} from "../schemas/auth.js";

export interface AuthRouteDeps {
  login: LoginCommand;
  loginByPhone: LoginByPhoneCommand;
  refresh: RefreshCommand;
  logout: LogoutCommand;
  register: RegisterCommand;
}

function toTokenPair(result: IssueTokensResult): TokenPairResponse {
  return {
    accessToken: result.accessToken,
    accessTokenExpiresAt: result.accessTokenExpiresAt.toISOString(),
    refreshToken: result.refreshToken,
    refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString(),
    user: {
      id: result.user.id,
      email: result.user.email?.value ?? null,
      phone: result.user.phone,
      fullName: result.user.fullName,
      kycStatus: result.user.kycStatus,
      roles: [...result.user.roles],
    },
  };
}

export async function registerAuthRoutes(app: FastifyInstance, deps: AuthRouteDeps): Promise<void> {
  app.post<{ Body: LoginRequest }>(
    "/v1/auth/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Email + password login.",
        body: LoginRequestJson,
        response: { 200: TokenPairResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const result = await deps.login.execute({
        email: req.body.email,
        password: req.body.password,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send(toTokenPair(result.value));
    },
  );

  app.post<{ Body: LoginByPhoneRequest }>(
    "/v1/auth/login-phone",
    {
      schema: {
        tags: ["auth"],
        summary: "Phone + password login.",
        body: LoginByPhoneRequestJson,
        response: { 200: TokenPairResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      // Re-run Zod parse to enforce the cross-field phone/country refinement
      // — Fastify's JSON-Schema validator can't express it.
      const parsed = LoginByPhoneRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        await reply.status(400).send({
          code: "validation.failed",
          message: parsed.error.issues[0]?.message ?? "Invalid request",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.loginByPhone.execute({
        phone: parsed.data.phone,
        password: parsed.data.password,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send(toTokenPair(result.value));
    },
  );

  app.post<{ Body: RegisterRequest }>(
    "/v1/auth/register",
    {
      schema: {
        tags: ["auth"],
        summary: "Create a new account.",
        body: RegisterRequestJson,
        response: { 201: TokenPairResponseJson, 409: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const parsed = RegisterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        await reply.status(400).send({
          code: "validation.failed",
          message: parsed.error.issues[0]?.message ?? "Invalid request",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.register.execute({
        email: parsed.data.email,
        password: parsed.data.password,
        phone: parsed.data.phone,
        fullName: parsed.data.fullName,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(201).send(toTokenPair(result.value));
    },
  );

  app.post<{ Body: RefreshRequest }>(
    "/v1/auth/refresh",
    {
      schema: {
        tags: ["auth"],
        summary: "Rotate a refresh token; replay of a revoked one revokes the family.",
        body: RefreshRequestJson,
        response: { 200: TokenPairResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const result = await deps.refresh.execute({ refreshToken: req.body.refreshToken });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send(toTokenPair(result.value));
    },
  );

  app.post<{ Body: LogoutRequest }>(
    "/v1/auth/logout",
    {
      schema: {
        tags: ["auth"],
        summary: "Revoke this refresh token's entire family.",
        body: LogoutRequestJson,
        response: { 204: { type: "null" } },
      },
    },
    async (req, reply) => {
      await deps.logout.execute({ refreshToken: req.body.refreshToken });
      await reply.status(204).send();
    },
  );
}
