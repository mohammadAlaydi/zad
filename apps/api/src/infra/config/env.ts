import { z } from "zod";

// All secrets and runtime config must come from the environment.
// Validation runs at boot — a missing or malformed value crashes the
// process before Fastify starts. See ADR-0006.
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default("0.0.0.0"),

    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),

    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

    // Comma-separated. Empty = block all (no CORS).
    CORS_ORIGINS: z.string().default(""),

    // Comma-separated allowlist for the /metrics endpoint.
    METRICS_ALLOWLIST: z.string().default("127.0.0.1,::1"),

    SENTRY_DSN: z.string().url().optional(),
    OTLP_ENDPOINT: z.string().url().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV === "production" && v.SENTRY_DSN === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SENTRY_DSN"],
        message: "SENTRY_DSN is required in production",
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // No logger yet — env validation runs before logger init.

    console.error("Environment validation failed:", parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
