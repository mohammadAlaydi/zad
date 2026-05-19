import {
  CreateUserItemRequestSchema,
  UpdateUserItemRequestSchema,
  UserItemListResponseSchema,
  UserItemResponseSchema,
  type CreateUserItemRequest,
  type UpdateUserItemRequest,
  type UserItemListResponse,
  type UserItemResponse,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../shared/middleware/auth.js";
import type { UserItem } from "../domain/UserItem.js";
import type { PrismaUserItemRepository } from "../infrastructure/PrismaUserItemRepository.js";

export interface UserdataRouteDeps {
  items: PrismaUserItemRepository;
}

const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
    meta: { type: "object", additionalProperties: true },
  },
} as const;

const target = "openApi3" as const;
const CreateBodyJson = zodToJsonSchema(CreateUserItemRequestSchema, { target });
const UpdateBodyJson = zodToJsonSchema(UpdateUserItemRequestSchema, { target });
const ListResponseJson = zodToJsonSchema(UserItemListResponseSchema, { target });
const ItemResponseJson = zodToJsonSchema(UserItemResponseSchema, { target });

// Allowed feature names. Mobile passes them as URL params so we keep the
// set explicit here — otherwise any string would create a new namespace.
const FEATURE_PATTERN = "^[a-z][a-z0-9_]{0,39}$";

function toResponse(item: UserItem): UserItemResponse {
  // Payload is `unknown` at the domain layer (we don't introspect it);
  // narrow to the validation contract's record shape at the boundary.
  return {
    id: item.id,
    feature: item.feature,
    payload: (item.payload ?? {}) as Record<string, unknown>,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function registerUserdataRoutes(
  app: FastifyInstance,
  deps: UserdataRouteDeps,
): Promise<void> {
  app.get<{ Params: { feature: string } }>(
    "/v1/userdata/:feature",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["userdata"],
        summary: "List the caller's items for a feature.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["feature"],
          properties: { feature: { type: "string", pattern: FEATURE_PATTERN } },
        },
        response: { 200: ListResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply
          .status(401)
          .send({
            code: "COMMON.UNAUTHORIZED",
            message: "Authentication required",
            requestId: req.id,
          });
        return;
      }
      const items = await deps.items.list(userId, req.params.feature);
      const response: UserItemListResponse = { items: items.map(toResponse) };
      await reply.status(200).send(response);
    },
  );

  app.post<{ Params: { feature: string }; Body: CreateUserItemRequest }>(
    "/v1/userdata/:feature",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["userdata"],
        summary: "Create an item for a feature.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["feature"],
          properties: { feature: { type: "string", pattern: FEATURE_PATTERN } },
        },
        body: CreateBodyJson,
        response: { 201: ItemResponseJson, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply
          .status(401)
          .send({
            code: "COMMON.UNAUTHORIZED",
            message: "Authentication required",
            requestId: req.id,
          });
        return;
      }
      const item = await deps.items.create({
        userId,
        feature: req.params.feature,
        payload: req.body.payload,
      });
      await reply.status(201).send(toResponse(item));
    },
  );

  app.put<{ Params: { feature: string; id: string }; Body: UpdateUserItemRequest }>(
    "/v1/userdata/:feature/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["userdata"],
        summary: "Replace an item's payload.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["feature", "id"],
          properties: {
            feature: { type: "string", pattern: FEATURE_PATTERN },
            id: { type: "string", format: "uuid" },
          },
        },
        body: UpdateBodyJson,
        response: { 200: ItemResponseJson, 401: ErrorResponseJson, 404: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply
          .status(401)
          .send({
            code: "COMMON.UNAUTHORIZED",
            message: "Authentication required",
            requestId: req.id,
          });
        return;
      }
      const updated = await deps.items.update(userId, req.params.id, req.body.payload);
      if (updated === null) {
        await reply
          .status(404)
          .send({ code: "USERDATA.NOT_FOUND", message: "Item not found", requestId: req.id });
        return;
      }
      await reply.status(200).send(toResponse(updated));
    },
  );

  app.delete<{ Params: { feature: string; id: string } }>(
    "/v1/userdata/:feature/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["userdata"],
        summary: "Delete an item.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["feature", "id"],
          properties: {
            feature: { type: "string", pattern: FEATURE_PATTERN },
            id: { type: "string", format: "uuid" },
          },
        },
        response: { 204: { type: "null" }, 401: ErrorResponseJson, 404: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const userId = req.requestContext.get("userId");
      if (userId === undefined) {
        await reply
          .status(401)
          .send({
            code: "COMMON.UNAUTHORIZED",
            message: "Authentication required",
            requestId: req.id,
          });
        return;
      }
      const ok = await deps.items.delete(userId, req.params.id);
      if (!ok) {
        await reply
          .status(404)
          .send({ code: "USERDATA.NOT_FOUND", message: "Item not found", requestId: req.id });
        return;
      }
      await reply.status(204).send();
    },
  );
}
