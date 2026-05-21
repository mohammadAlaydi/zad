import type { UpdateMeRequest } from "@zadpay/validation/auth";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type { UpdateProfileCommand } from "../../application/commands/UpdateProfile.js";
import type { GetMeQuery } from "../../application/queries/GetMe.js";
import { ErrorResponseJson, MeResponseJson, UpdateMeRequestJson } from "../schemas/auth.js";

export interface MeRouteDeps {
  getMe: GetMeQuery;
  updateProfile: UpdateProfileCommand;
}

export async function registerMeRoutes(app: FastifyInstance, deps: MeRouteDeps): Promise<void> {
  app.get(
    "/v1/identity/me",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary: "Current authenticated user.",
        security: [{ bearerAuth: [] }],
        response: { 200: MeResponseJson, 401: ErrorResponseJson, 404: ErrorResponseJson },
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
      const result = await deps.getMe.execute({ userId });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({
        id: result.value.id,
        email: result.value.email,
        phone: result.value.phone,
        fullName: result.value.fullName,
        kycStatus: result.value.kycStatus,
        roles: [...result.value.roles],
        createdAt: result.value.createdAt.toISOString(),
      });
    },
  );

  app.patch<{ Body: UpdateMeRequest }>(
    "/v1/identity/me",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary: "Update the authenticated user's editable profile fields.",
        security: [{ bearerAuth: [] }],
        body: UpdateMeRequestJson,
        response: { 200: MeResponseJson, 401: ErrorResponseJson, 404: ErrorResponseJson },
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
      const result = await deps.updateProfile.execute({
        userId,
        fullName: req.body.fullName,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send({
        id: result.value.id,
        email: result.value.email,
        phone: result.value.phone,
        fullName: result.value.fullName,
        kycStatus: result.value.kycStatus,
        roles: [...result.value.roles],
        createdAt: result.value.createdAt.toISOString(),
      });
    },
  );
}
