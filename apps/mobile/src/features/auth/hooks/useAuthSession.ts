import { useAuthStore } from "../store/authStore";

// Cheap selector hook. The nav guard subscribes to `session` and
// `bootstrapped`; route screens that need user data subscribe to
// `session?.user` etc.
export function useAuthSession() {
  return {
    session: useAuthStore((s) => s.session),
    bootstrapped: useAuthStore((s) => s.bootstrapped),
    isAuthenticated: useAuthStore((s) => s.session !== null),
  };
}
