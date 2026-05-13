import * as Sentry from "@sentry/node";
import { AppError, InternalError } from "@zadpay/errors";
import type { FastifyInstance, FastifyError } from "fastify";

// Maps AppError subclasses and Fastify validation errors to a uniform
// response shape: { code, message, meta?, requestId }. Everything else is
// caught, logged at error level, reported to Sentry, and answered with
// 500 INTERNAL_ERROR. Per ADR-0009: never return stack traces.
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      void reply.status(error.httpStatus).send({
        code: error.code,
        message: error.message,
        meta: error.meta,
        requestId: request.id,
      });
      return;
    }

    if (error.validation !== undefined) {
      void reply.status(400).send({
        code: "COMMON.VALIDATION",
        message: "Request validation failed",
        meta: { issues: error.validation },
        requestId: request.id,
      });
      return;
    }

    request.log.error({ err: error }, "Unhandled error");
    // No-op if SENTRY_DSN wasn't configured (init in instrument.ts skips).
    Sentry.captureException(error, {
      tags: { requestId: request.id, route: request.routeOptions.url ?? "unknown" },
    });
    const internal = new InternalError("Internal server error");
    void reply.status(internal.httpStatus).send({
      code: internal.code,
      message: internal.message,
      requestId: request.id,
    });
  });
}
