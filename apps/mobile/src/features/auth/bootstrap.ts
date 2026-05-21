// One-time wiring at app boot:
//   1. Tell the api client how to fetch the access token + run a refresh.
//   2. Try to silently refresh from any persisted refresh token so a
//      returning user lands on /(tabs)/home instead of /(auth)/welcome.
//   3. Listen for app foreground events and refresh the access token
//      when it's near expiry, so a long-backgrounded session resumes
//      without a 401-chain on the first network call.
//
// Called from app/_layout.tsx; the root guard waits on the returned
// promise resolution before rendering routes.

import type { TokenPairResponse } from "@zadpay/validation";
import { AppState, type AppStateStatus } from "react-native";
import { api } from "@/lib/api/instance";
import { secureStorage } from "@/lib/storage/secure";
import { authService } from "./services/authService";
import { getAccessToken, useAuthStore, type AuthSession } from "./store/authStore";

// If less than this much time remains on the access token when the app
// returns to the foreground, refresh proactively. The token TTL is 15min
// today so 2min gives us plenty of headroom for the next call.
const PROACTIVE_REFRESH_WINDOW_MS = 2 * 60 * 1000;

function toSession(pair: TokenPairResponse): AuthSession {
  return {
    accessToken: pair.accessToken,
    accessTokenExpiresAt: Date.parse(pair.accessTokenExpiresAt),
    user: {
      id: pair.user.id,
      email: pair.user.email,
      phone: pair.user.phone,
      fullName: pair.user.fullName,
      kycStatus: pair.user.kycStatus,
      roles: pair.user.roles,
    },
  };
}

// Exported so KYC (and any other feature) can force a token refresh after
// a state change that affects JWT claims (e.g. kyc_status flipping to
// approved on the server — the existing access token still says the old
// value until we rotate).
export async function refreshSession(): Promise<boolean> {
  return refreshFromStorage();
}

async function refreshFromStorage(): Promise<boolean> {
  const token = await secureStorage.getRefreshToken();
  if (token === null) return false;
  const result = await authService.refresh(token);
  if (!result.ok) {
    // Refresh token invalid / replayed / expired — wipe it.
    await secureStorage.clearRefreshToken();
    return false;
  }
  useAuthStore.getState().setSession(toSession(result.value));
  await secureStorage.setRefreshToken(result.value.refreshToken);
  return true;
}

// AppState listener identity, kept module-scoped so HMR doesn't stack
// duplicate listeners during dev.
let appStateSub: { remove: () => void } | null = null;

function handleAppStateChange(state: AppStateStatus): void {
  if (state !== "active") return;
  const session = useAuthStore.getState().session;
  if (session === null) return;
  const msLeft = session.accessTokenExpiresAt - Date.now();
  if (msLeft > PROACTIVE_REFRESH_WINDOW_MS) return;
  // Fire-and-forget; if it fails the api client's 401 interceptor will
  // still catch the next call and route the user to login.
  void refreshFromStorage();
}

export async function bootstrapAuth(): Promise<void> {
  api.setAuthHooks({
    getAccessToken,
    refresh: refreshFromStorage,
    onSessionLost: () => {
      useAuthStore.getState().clearSession();
      void secureStorage.clearRefreshToken();
    },
  });

  if (appStateSub === null) {
    appStateSub = AppState.addEventListener("change", handleAppStateChange);
  }

  try {
    await refreshFromStorage();
  } catch {
    // Network errors at boot are not fatal — user can log in manually.
  } finally {
    useAuthStore.getState().setBootstrapped();
  }
}
