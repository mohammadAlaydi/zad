import { QueryClient } from "@tanstack/react-query";

// Singleton React Query client. Defaults tuned for a mobile app:
//   • staleTime 30 s — balance + tx list don't need to refetch on every
//     mount, but a returning-from-background scenario should refresh.
//   • retry 1 — most failures here are transient network blips; surface
//     ApiError to the screen after one retry.
//   • refetchOnWindowFocus is a no-op on RN but the option is kept
//     explicit for clarity.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // mutations carry idempotency keys — caller decides if/when to retry
    },
  },
});

// Query keys live here so invalidation stays consistent across the app.
// Convention: tuple of strings, narrowing from broad → specific.
export const queryKeys = {
  wallet: {
    accounts: () => ["wallet", "accounts"] as const,
    balance: (accountId: string) => ["wallet", "balance", accountId] as const,
    transactions: (page: number, pageSize: number) =>
      ["wallet", "transactions", page, pageSize] as const,
  },
  identity: {
    me: () => ["identity", "me"] as const,
  },
  kyc: {
    application: () => ["kyc", "application"] as const,
  },
} as const;
