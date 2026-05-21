import { InboxPageResponseSchema, MarkAllReadResponseSchema } from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type {
  ListInboxQuery,
  MarkAllReadCommand,
  MarkReadCommand,
} from "../../application/Inbox.js";

export interface InboxRoutesDeps {
  list: ListInboxQuery;
  markRead: MarkReadCommand;
  markAllRead: MarkAllReadCommand;
}

const target = "openApi3" as const;
const InboxPageResponseJson = zodToJsonSchema(InboxPageResponseSchema, { target });
const MarkAllReadResponseJson = zodToJsonSchema(MarkAllReadResponseSchema, { target });

const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
  },
} as const;

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

export async function registerInboxRoutes(
  app: FastifyInstance,
  deps: InboxRoutesDeps,
): Promise<void> {
  app.get<{ Querystring: { cursor?: string; pageSize?: string } }>(
    "/v1/notifications",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary: "List the caller's notifications inbox (newest first, cursor-paginated).",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            cursor: { type: "string", format: "date-time" },
            pageSize: { type: "string" },
          },
        },
        response: { 200: InboxPageResponseJson, 401: ErrorResponseJson },
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
      const requested = req.query.pageSize === undefined ? NaN : Number(req.query.pageSize);
      const pageSize = Number.isFinite(requested)
        ? Math.min(Math.max(1, Math.trunc(requested)), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;
      const result = await deps.list.execute({
        userId,
        pageSize,
        cursor: req.query.cursor ?? null,
      });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to list notifications",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({
        items: result.value.items.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          data: n.data,
          readAt: n.readAt === null ? null : n.readAt.toISOString(),
          createdAt: n.createdAt.toISOString(),
        })),
        unreadCount: result.value.unreadCount,
        nextCursor: result.value.nextCursor,
      });
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/v1/notifications/:id/read",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary: "Mark a single notification read.",
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
      const result = await deps.markRead.execute({ userId, notificationId: req.params.id });
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
    "/v1/notifications/mark-all-read",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary: "Mark every notification read for the caller.",
        security: [{ bearerAuth: [] }],
        response: { 200: MarkAllReadResponseJson, 401: ErrorResponseJson },
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
      const result = await deps.markAllRead.execute({ userId });
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to mark all read",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({ marked: result.value.marked });
    },
  );
}
