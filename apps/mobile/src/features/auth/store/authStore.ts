// Auth session state. NOT persisted to AsyncStorage — that's the whole
// point of ADR-0006. The refresh token lives in SecureStore (Keychain /
// EncryptedSharedPreferences); the access token lives only in memory and
// dies with the JS context. Reboot the app → we read the refresh token
// back from SecureStore and exchange it for a fresh access token.

import { create } from "zustand";

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresAt: number; // ms epoch
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    kycStatus: "not_started" | "pending" | "submitted" | "review" | "approved" | "rejected";
    roles: readonly string[];
  };
}

interface AuthState {
  // Becomes true after the first refresh attempt finishes (success OR
  // failure). The nav guard waits on this to avoid a flash of /(auth)/welcome.
  bootstrapped: boolean;
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setBootstrapped: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  bootstrapped: false,
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
  setBootstrapped: () => set({ bootstrapped: true }),
}));

// Sync getter for the API client (which is a singleton constructed before
// any React tree exists — it can't call useAuthStore directly).
export function getAccessToken(): string | null {
  return useAuthStore.getState().session?.accessToken ?? null;
}
