// Tell expo-notifications how to render a push that arrives while the app
// is in the foreground. By default it suppresses the system banner — we
// want sender/receiver messages to surface even when the user is in the
// app, the same way InstaPay does.
//
// Called once at app boot from app/_layout.tsx, before any screen mounts.

import * as Notifications from "expo-notifications";

let configured = false;

export function configureNotificationHandler(): void {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
