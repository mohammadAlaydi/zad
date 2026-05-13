import type { RegisterRequest, TokenPairResponse } from "@zadpay/validation";
import { useState } from "react";
import { type ClientError } from "@/lib/api/errors";
import { secureStorage } from "@/lib/storage/secure";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

function toSession(pair: TokenPairResponse) {
  return {
    accessToken: pair.accessToken,
    accessTokenExpiresAt: Date.parse(pair.accessTokenExpiresAt),
    user: pair.user,
  } as const;
}

export interface UseRegisterResult {
  mutate: (input: RegisterRequest) => Promise<{ ok: true } | { ok: false; error: ClientError }>;
  isPending: boolean;
  error: ClientError | null;
  reset: () => void;
}

export function useRegister(): UseRegisterResult {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);

  async function mutate(input: RegisterRequest) {
    setPending(true);
    setError(null);
    try {
      const result = await authService.register(input);
      if (!result.ok) {
        setError(result.error);
        return { ok: false as const, error: result.error };
      }
      useAuthStore.getState().setSession(toSession(result.value));
      await secureStorage.setRefreshToken(result.value.refreshToken);
      return { ok: true as const };
    } finally {
      setPending(false);
    }
  }

  return { mutate, isPending, error, reset: () => setError(null) };
}
