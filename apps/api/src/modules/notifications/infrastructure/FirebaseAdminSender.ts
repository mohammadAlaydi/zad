import * as fs from "node:fs";
import * as path from "node:path";
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getMessaging, type Message, type Messaging } from "firebase-admin/messaging";
import { logger } from "../../../infra/logger/index.js";
import type {
  NotificationSender,
  PushMessage,
  SendResult,
} from "../domain/ports/NotificationSender.js";

// Modular firebase-admin (v11+) keys each app by name. We name ours
// "zadpay" so tsx-watch hot-reload doesn't error with "duplicate default".
function ensureApp(json: ServiceAccount): App {
  const existing = getApps().find((a) => a.name === "zadpay");
  return (
    existing ??
    initializeApp(
      {
        credential: cert(json),
      },
      "zadpay",
    )
  );
}

// Initialises Firebase Admin lazily from a service-account credential.
// When no credential is present, returns null and the composition root
// falls back to NoopSender so the rest of the app keeps working.
//
// Resolution order:
//   1. FIREBASE_CREDENTIALS_JSON — raw JSON string in the env (containerised
//      deployments, AWS Secrets Manager, etc.).
//   2. FIREBASE_CREDENTIALS_PATH — absolute or cwd-relative path to a file.
//   3. ./firebase-service-account.json next to the api workspace root
//      (local dev convenience).
//
// The credential is the standard service-account JSON downloaded from
// the Firebase console (Project Settings → Service accounts → Generate
// new private key).
export function createFirebaseSender(): NotificationSender | null {
  // ── 1. Inline JSON via env ─────────────────────────────────────────
  const envJson = process.env.FIREBASE_CREDENTIALS_JSON;
  if (envJson !== undefined && envJson.trim().length > 0) {
    try {
      const json = JSON.parse(envJson) as ServiceAccount;
      const app = ensureApp(json);
      logger.info(
        { projectId: app.options.projectId, source: "env:FIREBASE_CREDENTIALS_JSON" },
        "Firebase Admin initialised",
      );
      return new FirebaseAdminSender(getMessaging(app));
    } catch (err) {
      logger.error({ err }, "Failed to init Firebase Admin from FIREBASE_CREDENTIALS_JSON");
      return null;
    }
  }

  // ── 2 + 3. File on disk ────────────────────────────────────────────
  const envPath = process.env.FIREBASE_CREDENTIALS_PATH;
  const candidates = [envPath, path.resolve(process.cwd(), "firebase-service-account.json")].filter(
    (p): p is string => p !== undefined && p.length > 0,
  );

  let credsFile: string | null = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      credsFile = c;
      break;
    }
  }
  if (credsFile === null) {
    logger.warn(
      { checked: candidates },
      "Firebase credentials not configured (no JSON env var or file on disk) — push notifications will no-op",
    );
    return null;
  }

  try {
    const json = JSON.parse(fs.readFileSync(credsFile, "utf8")) as ServiceAccount;
    const app = ensureApp(json);
    logger.info({ projectId: app.options.projectId, credsFile }, "Firebase Admin initialised");
    return new FirebaseAdminSender(getMessaging(app));
  } catch (err) {
    logger.error({ err, credsFile }, "Failed to init Firebase Admin");
    return null;
  }
}

class FirebaseAdminSender implements NotificationSender {
  constructor(private readonly messaging: Messaging) {}

  async send(tokens: readonly string[], message: PushMessage): Promise<SendResult[]> {
    if (tokens.length === 0) return [];
    // sendEach takes per-message payloads; we send the same content to
    // every token but keep results positional so the caller can prune
    // dead tokens by index.
    const messages: Message[] = tokens.map((token) => ({
      token,
      notification: { title: message.title, body: message.body },
      data: message.data ?? {},
      android: {
        // `high` priority + the HIGH-importance "default" channel created
        // on the device (see mobile pushService.ts) is what lets Android
        // wake the screen and display the banner when the app is closed
        // or the phone is locked. Without channelId Android picks the
        // implicit "miscellaneous" channel which is silent on 8.0+.
        priority: "high" as const,
        notification: {
          channelId: "default",
          sound: "default",
          defaultSound: true,
          defaultVibrateTimings: true,
          priority: "high" as const,
          visibility: "public" as const,
        },
      },
      apns: {
        headers: {
          // Time-Sensitive interruption + high priority so iOS surfaces
          // the banner immediately on the lock screen, matching the
          // Android behaviour above.
          "apns-priority": "10",
          "apns-push-type": "alert",
        },
        payload: {
          aps: {
            alert: { title: message.title, body: message.body },
            sound: "default",
            "mutable-content": 1,
            "interruption-level": "time-sensitive",
          },
        },
      },
    }));

    try {
      const batch = await this.messaging.sendEach(messages);
      return batch.responses.map((r) => {
        if (r.success) return { ok: true } as const;
        const code = r.error?.code ?? "unknown";
        const reason =
          code === "messaging/registration-token-not-registered"
            ? ("unregistered" as const)
            : code === "messaging/invalid-argument" ||
                code === "messaging/invalid-registration-token"
              ? ("invalid_argument" as const)
              : ("unknown" as const);
        return { ok: false as const, reason, message: r.error?.message ?? code };
      });
    } catch (err) {
      // Catastrophic (network / auth) — surface as unknown for every token
      // so the caller doesn't blanket-prune the table.
      logger.error({ err }, "Firebase sendEach threw");
      return tokens.map(() => ({
        ok: false as const,
        reason: "unknown" as const,
        message: err instanceof Error ? err.message : String(err),
      }));
    }
  }
}

export class NoopNotificationSender implements NotificationSender {
  async send(tokens: readonly string[], message: PushMessage): Promise<SendResult[]> {
    logger.info(
      { recipients: tokens.length, title: message.title, body: message.body, data: message.data },
      "[push] no-op send (Firebase not configured)",
    );
    return tokens.map(() => ({ ok: true as const }));
  }
}
