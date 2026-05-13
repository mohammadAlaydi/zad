import Constants from "expo-constants";
import { z } from "zod";

// Read at app launch — config is immutable for the process lifetime.
// Per ADR-0001 the values come from app.json `extra` (dev/preview) and
// EAS-managed env vars (preview/production).
const ConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  // Sentry DSN is optional in dev (null/undefined skips init), required
  // in production builds — enforced at the EAS profile level via
  // appEnv === "production" + non-null sentryDsn.
  sentryDsn: z.string().url().nullable().optional(),
  appEnv: z.enum(["development", "preview", "production"]).default("development"),
});

const raw = Constants.expoConfig?.extra ?? {};
const parsed = ConfigSchema.safeParse(raw);

if (!parsed.success) {
  // Crash early — there's no path to recover from missing config.

  console.error("Invalid app config (extra):", parsed.error.flatten());
  throw new Error("Missing or invalid app.json `extra`");
}

export const config = parsed.data;
