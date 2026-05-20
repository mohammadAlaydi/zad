// Mobile push-notification registration.
//
// Lifecycle:
//   1. App boot (post-auth) → registerForPushAsync()
//   2. Asks for permission (no-op if already granted).
//   3. Gets the native device push token (FCM on Android, APNs on iOS).
//   4. POSTs to /v1/devices/push-token so the API can target this device.
//
// We use `getDevicePushTokenAsync()` (not `getExpoPushTokenAsync`) because
// the backend uses Firebase Admin SDK directly — Expo's relay is not in
// the loop. The token is whatever FCM/APNs returned.
//
// Re-registering with a different signed-in user is fine: the API upserts
// on the token, flipping ownership. So we never need to call "unregister"
// from the mobile side — the next login simply takes over the device.

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "@/lib/api/instance";

export interface PushRegistrationResult {
  ok: boolean;
  token?: string;
  reason?: "denied" | "not-a-device" | "no-token" | "api-failed";
}

export async function registerForPushAsync(): Promise<PushRegistrationResult> {
  // Emulators / web don't have FCM/APNs.
  if (!Device.isDevice) {
    return { ok: false, reason: "not-a-device" };
  }

  // Android 13+ requires runtime permission for notifications. iOS asks
  // every time until the user decides.
  const existing = await Notifications.getPermissionsAsync();
  let granted =
    existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted && existing.canAskAgain) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (!granted) {
    return { ok: false, reason: "denied" };
  }

  // Make sure the Android default channel exists. (No-op on iOS.)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "ZADPAY",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let nativeToken: string;
  try {
    const result = await Notifications.getDevicePushTokenAsync();
    nativeToken = result.data;
  } catch {
    return { ok: false, reason: "no-token" };
  }
  if (typeof nativeToken !== "string" || nativeToken.length === 0) {
    return { ok: false, reason: "no-token" };
  }

  const platform: "ios" | "android" | "web" =
    Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

  const post = await api.postVoid("/v1/devices/push-token", {
    token: nativeToken,
    platform,
    deviceName: Device.deviceName ?? null,
  });
  if (!post.ok) {
    return { ok: false, token: nativeToken, reason: "api-failed" };
  }
  return { ok: true, token: nativeToken };
}
