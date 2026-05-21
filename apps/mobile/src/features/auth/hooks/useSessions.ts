import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionListResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { secureStorage } from "@/lib/storage/secure";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const sessionsKey = ["identity", "sessions"] as const;

export function useSessions() {
  return useQuery<SessionListResponse, ClientError>({
    queryKey: sessionsKey,
    queryFn: async () => {
      const result = await authService.listSessions();
      if (!result.ok) throw result.error;
      return result.value;
    },
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation<void, ClientError, string>({
    mutationFn: async (sessionId: string) => {
      const result = await authService.revokeSession(sessionId);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionsKey });
    },
  });
}

// Lost-device lock. After the backend confirms the revoke, we also clear
// the local session + refresh token so the calling device immediately
// drops to the auth flow. The user must log in again.
export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation<{ revoked: number }, ClientError, void>({
    mutationFn: async () => {
      const result = await authService.revokeAllSessions();
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: async () => {
      await secureStorage.clearRefreshToken();
      useAuthStore.getState().clearSession();
      void qc.invalidateQueries({ queryKey: sessionsKey });
    },
  });
}
