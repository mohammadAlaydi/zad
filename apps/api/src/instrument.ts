// Sentry must be initialised BEFORE any other instrumentation per
// @sentry/node v8 docs. server.ts imports this as its first statement.

import * as Sentry from "@sentry/node";
import { env } from "./infra/config/env.js";

if (env.SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Sampling — production gets 10% traces by default. Adjust per ADR-0009.
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 0,
  });
}
