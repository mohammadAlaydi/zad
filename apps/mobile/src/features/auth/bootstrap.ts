// One-time wiring at app boot:
//   1. Tell the api client how to fetch the access token + run a refresh.
//   2. Try to silently refresh from any persisted refresh token so a
//      returning user lands on /(tabs)/home instead of /(auth)/welcome.
//
// Called from app/_layout.tsx; the root guard waits on the returned
// promise resolution before rendering routes.

import type { TokenPairResponse } from "@zadpay/validation";
import { api } from "@/lib/api/instance";
import { secureStorage } from "@/lib/storage/secure";
import { authService } from "./services/authService";
import { getAccessToken, useAuthStore, type AuthSession } from "./store/authStore";

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

export async function bootstrapAuth(): Promise<void> {
  api.setAuthHooks({
    getAccessToken,
    refresh: refreshFromStorage,
    onSessionLost: () => {
      useAuthStore.getState().clearSession();
      void secureStorage.clearRefreshToken();
    },
  });

  try {
    await refreshFromStorage();
  } catch {
    // Network errors at boot are not fatal — user can log in manually.
  } finally {
    useAuthStore.getState().setBootstrapped();
  }
}
