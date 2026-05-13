import type {
  KycApplicationResponse,
  PresignDocumentRequest,
  PresignDocumentResponse,
} from "@zadpay/validation";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../../../shared/middleware/auth.js";
import type { EnsureApplicationCommand } from "../../application/commands/EnsureApplication.js";
import type { NotifyDocumentUploadedCommand } from "../../application/commands/NotifyDocumentUploaded.js";
import type { PresignDocumentCommand } from "../../application/commands/PresignDocument.js";
import type { SubmitForReviewCommand } from "../../application/commands/SubmitForReview.js";
import type { GetMyApplicationQuery } from "../../application/queries/GetMyApplication.js";
import type { KycApplication } from "../../domain/entities/KycApplication.js";
import type { KycDocument } from "../../domain/entities/KycDocument.js";
import {
  ErrorResponseJson,
  KycApplicationResponseJson,
  NotifyDocumentUploadedRequestJson,
  PresignDocumentRequestJson,
  PresignDocumentResponseJson,
} from "../schemas/kyc.js";

export interface ApplicationsRouteDeps {
  ensure: EnsureApplicationCommand;
  submit: SubmitForReviewCommand;
  presign: PresignDocumentCommand;
  notifyUploaded: NotifyDocumentUploadedCommand;
  query: GetMyApplicationQuery;
}

function toResponse(application: KycApplication, documents: KycDocument[]): KycApplicationResponse {
  return {
    id: application.id,
    status: application.status,
    submittedAt: application.submittedAt?.toISOString() ?? null,
    decidedAt: application.decidedAt?.toISOString() ?? null,
    rejectionReason: application.rejectionReason,
    documents: documents.map((d) => ({
      id: d.id,
      type: d.type,
      mimeType: d.mimeType,
      status: d.status,
      uploadedAt: d.uploadedAt?.toISOString() ?? null,
    })),
  };
}

export async function registerKycRoutes(
  app: FastifyInstance,
  deps: ApplicationsRouteDeps,
): Promise<void> {
  // POST /v1/kyc/applications — idempotent: returns the user's application,
  // creating it if missing. Mobile calls this on first KYC screen visit.
  app.post(
    "/v1/kyc/applications",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["kyc"],
        summary: "Get or create the caller's KYC application.",
        security: [{ bearerAuth: [] }],
        response: { 200: KycApplicationResponseJson, 401: ErrorResponseJson },
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
      const result = await deps.ensure.execute({ userId });
      // ensure never errors today (the type is `never`), but the result wrap
      // keeps the call shape uniform.
      if (!result.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to ensure application",
          requestId: req.id,
        });
        return;
      }
      const view = await deps.query.execute({ userId });
      if (!view.ok) {
        // Can't happen — we just created the application.
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to load application",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send(toResponse(result.value, view.value.documents));
    },
  );

  app.get(
    "/v1/kyc/applications/me",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["kyc"],
        summary: "Get the caller's KYC application status.",
        security: [{ bearerAuth: [] }],
        response: {
          200: KycApplicationResponseJson,
          404: ErrorResponseJson,
          401: ErrorResponseJson,
        },
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
      const result = await deps.query.execute({ userId });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const v = result.value;
      await reply.status(200).send({
        id: v.id,
        status: v.status,
        submittedAt: v.submittedAt?.toISOString() ?? null,
        decidedAt: v.decidedAt?.toISOString() ?? null,
        rejectionReason: v.rejectionReason,
        documents: v.documents.map((d) => ({
          id: d.id,
          type: d.type,
          mimeType: d.mimeType,
          status: d.status,
          uploadedAt: d.uploadedAt?.toISOString() ?? null,
        })),
      });
    },
  );

  app.post(
    "/v1/kyc/applications/submit",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["kyc"],
        summary: "Submit the caller's KYC application for review.",
        security: [{ bearerAuth: [] }],
        response: {
          200: KycApplicationResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
          422: ErrorResponseJson,
        },
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
      const result = await deps.submit.execute({ userId });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const view = await deps.query.execute({ userId });
      if (!view.ok) {
        await reply.status(500).send({
          code: "COMMON.INTERNAL",
          message: "Failed to load application",
          requestId: req.id,
        });
        return;
      }
      await reply.status(200).send(toResponse(result.value, view.value.documents));
    },
  );

  app.post<{ Body: PresignDocumentRequest }>(
    "/v1/kyc/documents/presign",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["kyc"],
        summary: "Get a short-lived presigned URL to upload a KYC document.",
        security: [{ bearerAuth: [] }],
        body: PresignDocumentRequestJson,
        response: {
          200: PresignDocumentResponseJson,
          401: ErrorResponseJson,
          404: ErrorResponseJson,
        },
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
      const result = await deps.presign.execute({
        userId,
        type: req.body.type,
        mimeType: req.body.mimeType,
      });
      if (!result.ok) {
        await reply.status(result.error.httpStatus).send({
          code: result.error.code,
          message: result.error.message,
          requestId: req.id,
        });
        return;
      }
      const response: PresignDocumentResponse = {
        documentId: result.value.documentId,
        uploadUrl: result.value.presigned.uploadUrl,
        s3Key: result.value.presigned.s3Key,
        expiresAt: result.value.presigned.expiresAt.toISOString(),
        maxSizeBytes: result.value.presigned.maxSizeBytes,
      };
      await reply.status(200).send(response);
    },
  );

  app.post<{ Body: { sizeBytes: number }; Params: { id: string } }>(
    "/v1/kyc/documents/:id/notify",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["kyc"],
        summary: "Confirm a KYC document was uploaded to the presigned URL.",
        security: [{ bearerAuth: [] }],
        body: NotifyDocumentUploadedRequestJson,
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
      const result = await deps.notifyUploaded.execute({
        documentId: req.params.id,
        userId,
        sizeBytes: req.body.sizeBytes,
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
