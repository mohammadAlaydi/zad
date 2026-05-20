import type { RegisterPushTokenRequest, UnregisterPushTokenRequest } from "@zadpay/validation";
import {
  RegisterPushTokenRequestSchema,
  UnregisterPushTokenRequestSchema,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type {
  RegisterPushTokenCommand,
  UnregisterPushTokenCommand,
} from "../../application/RegisterPushToken.js";

export interface DeviceRoutesDeps {
  register: RegisterPushTokenCommand;
  unregister: UnregisterPushTokenCommand;
}

const target = "openApi3" as const;
const RegisterPushTokenRequestJson = zodToJsonSchema(RegisterPushTokenRequestSchema, { target });
const UnregisterPushTokenRequestJson = zodToJsonSchema(UnregisterPushTokenRequestSchema, {
  target,
});

const ErrorResponseJson = {
  type: "object",
  required: ["code", "message", "requestId"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
  },
} as const;

export async function registerDeviceRoutes(
  app: FastifyInstance,
  deps: DeviceRoutesDeps,
): Promise<void> {
  app.post<{ Body: RegisterPushTokenRequest }>(
    "/v1/devices/push-token",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary:
          "Register an FCM/APNs push token for the authenticated user. Safe to call repeatedly with the same token.",
        security: [{ bearerAuth: [] }],
        body: RegisterPushTokenRequestJson,
        response: { 204: { type: "null" }, 401: ErrorResponseJson },
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
      await deps.register.execute({
        userId,
        token: req.body.token,
        platform: req.body.platform,
        deviceName: req.body.deviceName ?? null,
      });
      await reply.status(204).send();
    },
  );

  app.delete<{ Body: UnregisterPushTokenRequest }>(
    "/v1/devices/push-token",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["notifications"],
        summary: "Unregister a push token (called on logout / token rotation).",
        security: [{ bearerAuth: [] }],
        body: UnregisterPushTokenRequestJson,
        response: { 204: { type: "null" }, 401: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      await deps.unregister.execute({ token: req.body.token });
      await reply.status(204).send();
    },
  );
}
