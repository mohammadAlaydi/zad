// Outbound push abstraction. Implementations: FirebaseAdminSender (FCM),
// NoopSender (dev fallback when credentials aren't configured).

export interface PushMessage {
  title: string;
  body: string;
  // Free-form payload the mobile app reads to deep-link the user when
  // they tap the notification.
  data?: Record<string, string>;
}

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "unregistered" | "invalid_argument" | "unknown"; message: string };

export interface NotificationSender {
  // Returns one result per token. Order matches the input. Implementations
  // must NEVER throw — failures come back as `ok: false` so the caller
  // can prune dead tokens without try/catch noise.
  send(tokens: readonly string[], message: PushMessage): Promise<SendResult[]>;
}
