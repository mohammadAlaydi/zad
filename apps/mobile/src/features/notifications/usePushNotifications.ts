// React hook that wires up the push lifecycle for an authenticated user.
//
//   • Registers the device's FCM/APNs token with the API when the user
//     is signed in.
//   • Re-runs on session change so a fresh login attributes the device
//     to the new userId.
//   • Adds a tap listener so when the user taps a push, we route them
//     into the matching screen (transactions tab today; we can deep-link
//     to the specific transaction once that screen exists).
//   • Invalidates the wallet caches when ANY push lands while the app is
//     in the foreground, so balance + transactions update without
//     waiting for the 5s poll tick.

import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { useAuthSession } from "@/features/auth";
import { registerForPushAsync } from "./pushService";

export function usePushNotifications(): void {
  const { session } = useAuthSession();
  const qc = useQueryClient();
  const userId = session?.user.id ?? null;

  // 1. Register on every session change. Safe to call repeatedly —
  //    the API upserts on the token value.
  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    void (async () => {
      const result = await registerForPushAsync();
      if (!cancelled && !result.ok) {
        // Permission denied or no real device — silently no-op. The user
        // can grant the permission later from system settings.
        // eslint-disable-next-line no-console
        console.log("[push] registration skipped:", result.reason);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 2. Foreground arrivals — bust the wallet cache + inbox cache so the
  //    user sees the new row without a manual pull.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      void qc.invalidateQueries({ queryKey: ["notifications", "inbox"] });
    });
    return () => sub.remove();
  }, [qc]);

  // 3. Tap handling — route to a sensible screen. The push data carries
  //    a `kind` field set by the API ("transfer.sent" | "transfer.received").
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data ?? {};
      const kind = typeof data["kind"] === "string" ? data["kind"] : null;
      // Default landing: the inbox, so any push type lands somewhere
      // meaningful even if we haven't taught the app about it yet.
      // Transfer payloads still get the transactions tab so the user can
      // see the new balance immediately.
      if (kind === "transfer.received" || kind === "transfer.sent") {
        router.push("/(tabs)/expenses");
      } else {
        router.push("/notifications");
      }
    });
    return () => sub.remove();
  }, []);
}
