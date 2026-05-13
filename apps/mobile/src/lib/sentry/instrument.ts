// Sentry init for the mobile app. Imported at the top of _layout.tsx so it
// runs before any feature module loads — matches the @sentry/react-native
// guidance about initialising before instrumentation hooks attach.
//
// Production source-map upload via EAS post-build script lands in PR-15;
// for PR-13 we wire the runtime side only.

import * as Sentry from "@sentry/react-native";
import { config } from "../config/index";

if (config.sentryDsn !== null && config.sentryDsn !== undefined) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.appEnv,
    enableAutoSessionTracking: true,
    // Sample 10% of traces in production, none in dev.
    tracesSampleRate: config.appEnv === "production" ? 0.1 : 0,
    // Pre-send hook strips obvious PII from event payloads.
    beforeSend(event) {
      // Cards, JWTs, refresh tokens, phone numbers — scrub if they leak
      // into breadcrumbs/messages.
      if (typeof event.message === "string") {
        event.message = scrubSecrets(event.message);
      }
      for (const bc of event.breadcrumbs ?? []) {
        if (typeof bc.message === "string") {
          bc.message = scrubSecrets(bc.message);
        }
      }
      return event;
    },
  });
}

function scrubSecrets(s: string): string {
  return s
    .replace(/\b\d{13,19}\b/g, "[CARD]") // PANs
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[JWT]")
    .replace(/refreshToken[":\s]+[A-Za-z0-9_-]{20,}/gi, "refreshToken=[REDACTED]");
}

export { Sentry };
