import type { MeResponse, UpdateMeRequest } from "@zadpay/validation";
import { useState } from "react";
import { type ClientError } from "@/lib/api/errors";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export interface UseUpdateProfileResult {
  mutate: (
    input: UpdateMeRequest,
  ) => Promise<{ ok: true; user: MeResponse } | { ok: false; error: ClientError }>;
  isPending: boolean;
  error: ClientError | null;
  reset: () => void;
}

// Patches the authenticated user's editable profile fields (currently just
// fullName) and merges the response back into the auth session so every
// screen reading `useAuthSession().session?.user` re-renders with the new
// value without a round-trip to GET /me.
export function useUpdateProfile(): UseUpdateProfileResult {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);

  async function mutate(input: UpdateMeRequest) {
    setPending(true);
    setError(null);
    try {
      const result = await authService.updateProfile(input);
      if (!result.ok) {
        setError(result.error);
        return { ok: false as const, error: result.error };
      }
      const current = useAuthStore.getState().session;
      if (current !== null) {
        useAuthStore.getState().setSession({
          ...current,
          user: {
            id: result.value.id,
            email: result.value.email,
            phone: result.value.phone,
            fullName: result.value.fullName,
            kycStatus: result.value.kycStatus,
            roles: result.value.roles,
          },
        });
      }
      return { ok: true as const, user: result.value };
    } finally {
      setPending(false);
    }
  }

  return { mutate, isPending, error, reset: () => setError(null) };
}
