import pino, { type LoggerOptions } from "pino";
import { env } from "../config/env.js";

// Shared Pino config: Fastify gets these options (creates its own logger
// instance for request lifecycle) and `logger` below is the standalone
// instance for code that runs outside the request scope (env validation,
// boot/shutdown, background jobs).
const isDev = env.NODE_ENV === "development";

export const loggerOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'req.headers["x-api-key"]',
      "*.password",
      "*.cvv",
      "*.cardNumber",
      "*.token",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
  base: {
    service: "@zadpay/api",
    env: env.NODE_ENV,
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss.l" },
        },
      }
    : {}),
};

export const logger = pino(loggerOptions);
