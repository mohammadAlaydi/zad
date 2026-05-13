import { useState } from "react";
import { secureStorage } from "@/lib/storage/secure";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout(): { logout: () => Promise<void>; isPending: boolean } {
  const [isPending, setPending] = useState(false);

  async function logout(): Promise<void> {
    setPending(true);
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (refreshToken !== null) {
        // Fire-and-forget: even if the server is unreachable, we clear
        // local state. The server-side family will eventually expire via TTL.
        await authService.logout(refreshToken);
      }
      await secureStorage.clearRefreshToken();
      useAuthStore.getState().clearSession();
    } finally {
      setPending(false);
    }
  }

  return { logout, isPending };
}
