import * as SecureStore from "expo-secure-store";

// Refresh-token storage. AsyncStorage is NOT acceptable here per ADR-0006:
// it's plaintext on disk on Android, and a rooted/jailbroken device can edit
// it to forge a session. SecureStore uses Keychain (iOS) and
// EncryptedSharedPreferences (Android) — gated by the device's own
// passcode/biometric.

const REFRESH_TOKEN_KEY = "zadpay.refreshToken";

const options: SecureStore.SecureStoreOptions = {
  // AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: the token is inaccessible until the
  // device is first unlocked after boot, and never leaves this device via
  // iCloud Keychain etc. ADR-0006 trade-off.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureStorage = {
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY, options);
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, options);
  },
  async clearRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options);
  },
};
