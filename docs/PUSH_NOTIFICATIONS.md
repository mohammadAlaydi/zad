# Push notifications setup

ZADPAY sends push notifications via Firebase Cloud Messaging (FCM) on the
backend and `expo-notifications` on the mobile app. The current code is
wired end-to-end — once the Firebase credentials below are dropped in, the
sender + recipient of every transfer get a push, even when the app is
backgrounded or closed.

While credentials are missing the API logs `[push] no-op send (Firebase
not configured)` for every transfer and everything else (signup, login,
transfers) continues to work normally.

## What you need from Firebase

1. Create a Firebase project at <https://console.firebase.google.com>.
2. Add an **Android** app with package name `com.zadpay.app`.
3. (Optional) Add an **iOS** app with bundle id `com.zadpay.app`.
4. Download the config files:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS, if you want iOS push)
5. Generate a service-account key for the backend:
   **Project Settings → Service accounts → Generate new private key**
   You'll get a JSON file. Save it as `firebase-service-account.json`.

## Where the files go

| File                            | Location                                 | Purpose                                          |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `firebase-service-account.json` | `apps/api/firebase-service-account.json` | Backend auth to FCM (server-to-server send)      |
| `google-services.json`          | `apps/mobile/google-services.json`       | Android client connects to your Firebase project |
| `GoogleService-Info.plist`      | `apps/mobile/GoogleService-Info.plist`   | iOS client (only if you also want iOS push)      |

All three are in `.gitignore` — never commit them.

The API path can be overridden via the `FIREBASE_CREDENTIALS_PATH` env
var in `apps/api/.env` if you'd rather keep the JSON elsewhere.

## How to verify it's working

Backend:

```
curl -s -X POST http://localhost:3000/v1/wallet/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"recipientPhone":"123","amount":{"amount":"500","currency":"USD"},"password":"..."}'
```

Watch the API logs:

- **No credentials yet** → `[push] no-op send (Firebase not configured)`
  with `recipients: N`
- **Credentials in place** → `Firebase Admin initialised` at boot, and
  every transfer produces a real FCM call (no log entry on success, only
  on failure)

Mobile:

1. On Android you need a **dev client build** (`eas build --profile
development`). Push notifications don't work in stock Expo Go on
   Android for SDK 53+. SDK 51 (current) still has them in Expo Go but
   only via Expo's push token — for direct FCM you need the dev client.
2. After signing in, the app POSTs the device token to
   `POST /v1/devices/push-token`. Check `notifications.push_tokens` in
   Postgres to confirm.
3. Send money to a second account — both devices should get a banner.

## What the user sees

| Event                     | Title            | Body                                    |
| ------------------------- | ---------------- | --------------------------------------- |
| Sender (after their send) | `Money sent`     | `You sent $X.XX USD to {Recipient}.`    |
| Recipient (after receipt) | `Money received` | `You received $X.XX USD from {Sender}.` |

Tapping a notification:

- Received transfer → opens the **Expenses** (transactions) tab.
- Sent transfer → opens **Home**.

Each push carries a `data` payload (`kind`, `transactionId`,
`counterparty`, `amount`, `currency`) so we can deep-link to a per-tx
screen later without backend changes.
