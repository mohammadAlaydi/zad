import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type {
  RevokeAllSessionsCommand,
  RevokeSessionCommand,
} from "../../application/commands/RevokeSession.js";
import type { ListSessionsQuery } from "../../application/queries/ListSessions.js";
import {
  ErrorResponseJson,
  RevokeAllSessionsResponseJson,
  SessionListResponseJson,
} from "../schemas/auth.js";

export interface SessionRouteDeps {
  listSessions: ListSessionsQuery;
  revokeSession: RevokeSessionCommand;
  revokeAllSessions: RevokeAllSessionsCommand;
}

export async function registerSessionRoutes(
  app: FastifyInstance,
  deps: SessionRouteDeps,
): Promise<void> {
  app.get(
    "/v1/identity/sessions",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary: "List active sessions (logged-in devices) for the caller.",
        security: [{ bearerAuth: [] }],
        response: { 200: SessionListResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.listSessions.execute({ userId });
      if (!result.ok) {
        // ListSessions has no failure mode but TypeScript needs the branch.
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to list sessions",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({
        sessions: result.value.map((s) => ({
          id: s.id,
          family: s.family,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
        })),
      });
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/identity/sessions/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary: "Revoke a single session (sign out one device).",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 204: { type: "null" }, 401: ErrorResponseJson, 404: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.revokeSession.execute({ userId, sessionId: req.params.id });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(204).send();
    },
  );

  app.post(
    "/v1/identity/sessions/revoke-all",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary:
          "Revoke every active session for the caller (lost-device lock; signs out the calling device too).",
        security: [{ bearerAuth: [] }],
        response: { 200: RevokeAllSessionsResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply.status(401).send({
          code: "COMMON.UNAUTHORIZED",
          message: "Authentication required",
          requestId: req.id,
        });
        return;
      }
      const result = await deps.revokeAllSessions.execute({ userId });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to revoke sessions",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({ revoked: result.value.revoked });
    },
  );
}
