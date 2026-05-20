import type { ChangePasswordRequest, RecipientLookupResponse } from "@zadpay/validation/auth";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type { ChangePasswordCommand } from "../../application/commands/ChangePassword.js";
import type { PhoneLookup } from "../../application/queries/LookupByPhone.js";
import {
  ChangePasswordRequestJson,
  ErrorResponseJson,
  RecipientLookupResponseJson,
} from "../schemas/auth.js";

// PhoneAccountResolver lets identity render the recipient's wallet accountId
// alongside their profile in a single round-trip from the mobile client,
// without taking a hard dependency on wallet's internals.
export interface PhoneAccountResolver {
  primaryAccountForUser(userId: string): Promise<{ accountId: string; currency: string } | null>;
}

export interface LookupRouteDeps {
  phoneLookup: PhoneLookup;
  accounts: PhoneAccountResolver;
  changePassword: ChangePasswordCommand;
}

export async function registerLookupRoutes(
  app: FastifyInstance,
  deps: LookupRouteDeps,
): Promise<void> {
  app.get<{ Querystring: { phone?: string } }>(
    "/v1/identity/lookup",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["identity"],
        summary: "Resolve a phone number to its ZADPAY recipient + wallet.",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["phone"],
          properties: { phone: { type: "string" } },
        },
        response: { 200: RecipientLookupResponseJson, 404: ErrorResponseJson },
      },
    },
    async (req, reply) => {
      const phone = req.query.phone?.trim();
      if (phone === undefined || phone.length === 0) {
        await reply.status(400).send({
          code: "COMMON.VALIDATION",
          message: "phone is required",
          requestId: req.id,
        });
        return;
      }
      const callerId = req.requestContext.get("userId");
      const found = await deps.phoneLookup.byPhone(phone);
      if (found === null || found.userId === callerId) {
        await reply.status(404).send({
          code: "IDENTITY.RECIPIENT_NOT_FOUND",
          message: "No ZADPAY user found with this phone number",
          requestId: req.id,
        });
        return;
      }
      const account = await deps.accounts.primaryAccountForUser(found.userId);
      if (account === null) {
        await reply.status(404).send({
          code: "IDENTITY.RECIPIENT_NOT_FOUND",
          message: "Recipient has no wallet yet",
          requestId: req.id,
        });
        return;
      }
      const body: RecipientLookupResponse = {
        userId: found.userId,
        fullName: found.fullName ?? "ZADPAY user",
        phone: found.phone,
        accountId: account.accountId,
        currency: account.currency,
      };
      await reply.status(200).send(body);
    },
  );

  app.post<{ Body: ChangePasswordRequest }>(
    "/v1/auth/change-password",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["auth"],
        summary: "Change the authenticated user's password.",
        security: [{ bearerAuth: [] }],
        body: ChangePasswordRequestJson,
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
      const result = await deps.changePassword.execute({
        userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
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
}
