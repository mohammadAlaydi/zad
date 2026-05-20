export interface PushTokenRow {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  deviceName: string | null;
}

// Per ADR-0005 the rest of the codebase imports only the abstract port —
// the Prisma implementation lives under infrastructure/.
export interface PushTokenRepository {
  upsert(input: PushTokenRow): Promise<void>;
  remove(token: string): Promise<void>;
  listForUser(userId: string): Promise<PushTokenRow[]>;
  // Removes a token that FCM/APNs reported as invalid (e.g. uninstalled
  // app). The notification sender calls this when the provider returns
  // an "unregistered" error so we don't keep sending to dead tokens.
  pruneInvalid(token: string): Promise<void>;
}
