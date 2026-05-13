import type {
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterRequest,
  TokenPairResponse,
} from "@zadpay/validation/auth";
import type { FastifyInstance } from "fastify";
import type { LoginCommand } from "../../application/commands/Login.js";
import type { LogoutCommand } from "../../application/commands/Logout.js";
import type { RefreshCommand } from "../../application/commands/Refresh.js";
import type { RegisterCommand } from "../../application/commands/Register.js";
import type { IssueTokensResult } from "../../application/commands/shared/issueTokens.js";
import {
  ErrorResponseJson,
  LoginRequestJson,
  LogoutRequestJson,
  RefreshRequestJson,
  RegisterRequestJson,
  TokenPairResponseJson,
} from "../schemas/auth.js";

export interface AuthRouteDeps {
  login: LoginCommand;
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
      email: result.user.email.value,
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
      const result = await deps.register.execute({
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
