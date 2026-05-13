# ADR-0003: Mobile architecture — feature folders, split state, typed service layer

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** mobile

## Context

The mobile app today co-locates nothing. Routes live under [app/](../../app/), shared components under [src/components/](../../src/components/), six Zustand stores under [src/store/](../../src/store/) — but feature-specific logic, hooks, and types are scattered. The largest store ([src/store/appStore.ts](../../src/store/appStore.ts), 531 lines) owns 18 domains. Components import store actions directly; there is no service layer, no React Query, no concept of pending/error/success for server calls.

Audit reference: [audit §3 S1-7, S1-8, S1-10, S1-12](../audit.md).

## Decision

Adopt a **feature-folder mobile architecture** with strict layering. Routing stays in `app/` (Expo Router is file-based and we don't fight the framework), but **all non-routing code moves into `src/features/<domain>/`**.

### Layout

```
apps/mobile/
├── app/                              # Expo Router — thin route files only
│   ├── _layout.tsx                   # root: providers + nav guard
│   ├── (auth)/
│   │   └── login.tsx                 # imports from src/features/auth
│   ├── (tabs)/
│   │   └── home.tsx                  # imports from src/features/wallet
│   └── send/
│       └── index.tsx                 # imports from src/features/wallet
└── src/
    ├── features/
    │   ├── auth/
    │   │   ├── components/           # LoginForm.tsx, OTPInput.tsx
    │   │   ├── hooks/                # useLogin.ts, useBiometricUnlock.ts
    │   │   ├── services/             # authService.ts — wraps api client
    │   │   ├── store/                # authStore.ts (Zustand, client-only)
    │   │   ├── types/                # types specific to this feature
    │   │   └── index.ts              # PUBLIC API of this feature
    │   ├── kyc/
    │   ├── wallet/
    │   └── ...                       # one folder per domain (see module-inventory)
    ├── shared/
    │   ├── components/               # Button, Input, Screen, Header — UI primitives only
    │   ├── hooks/                    # useHaptic, useColorScheme
    │   ├── utils/
    │   └── types/                    # Money, Currency, ISO-8601 brand
    ├── lib/
    │   ├── api/                      # the typed HTTP client (see below)
    │   ├── storage/                  # SecureStore / AsyncStorage wrappers
    │   ├── i18n/                     # i18next setup
    │   └── telemetry/                # Sentry + logger
    └── app/                          # providers, query client, error boundary
        ├── providers.tsx
        ├── queryClient.ts
        └── ErrorBoundary.tsx
```

### Rules

1. **Routes are thin.** A file under `app/` may only: render a single feature component, parse params, and pass them in. No business logic, no styles beyond layout, no direct store access.
2. **Each feature is a black box.** `src/features/<x>/index.ts` is the only thing other features import from. Cross-feature imports of internals are an ESLint error (`no-restricted-imports` patterns).
3. **State split:** client state in Zustand (per-feature stores), server state in React Query. Nothing crosses the boundary.
4. **Service layer is mandatory** for anything that touches the network. Components call hooks; hooks call services; services call the typed `api` client; `api` returns `Result<T, ApiError>`.
5. **One styling system.** NativeWind only. Inline-style and raw `Colors.*` usages are migrated over time; ESLint warns, then errors after the migration PR lands.

### Service layer shape

```ts
// src/lib/api/client.ts
import { z } from "zod";
import { Result, ok, err } from "@zadpay/errors";

export const api = {
  async post<TReq, TRes>(
    path: string,
    body: TReq,
    schema: z.ZodType<TRes>,
    opts?: { idempotencyKey?: string },
  ): Promise<Result<TRes, ApiError>> {
    /* ... */
  },
  // get, put, delete similar
};

// src/features/wallet/services/transferService.ts
import { TransferRequestSchema, TransferResponseSchema } from "@zadpay/validation";

export async function createTransfer(req: TransferRequest, idempotencyKey: string) {
  return api.post("/v1/wallet/transfers", req, TransferResponseSchema, { idempotencyKey });
}

// src/features/wallet/hooks/useCreateTransfer.ts
export function useCreateTransfer() {
  return useMutation({
    mutationFn: ({ req, key }: { req: TransferRequest; key: string }) =>
      createTransfer(req, key).then((r) =>
        r.match({
          ok: (v) => v,
          err: (e) => {
            throw e;
          },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] }),
  });
}
```

### Navigation guard

Top-level guard lives in `app/_layout.tsx`:

```tsx
function RootGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuthSession(); // hook over SecureStore + refresh
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (!auth.isAuthenticated && !inAuthGroup) router.replace("/(auth)/welcome");
    else if (
      auth.isAuthenticated &&
      auth.kycStatus !== "approved" &&
      !segments[0]?.startsWith("(auth)")
    )
      router.replace("/(auth)/personal-info");
    else if (auth.isAuthenticated && inAuthGroup) router.replace("/(tabs)/home");
  }, [auth, segments]);

  return <>{children}</>;
}
```

Guard reads from a **derived** auth state (refresh-token presence + decoded JWT claims + KYC status from `/v1/identity/me`), **not** from a persisted boolean in AsyncStorage.

### Error boundaries

- **Root boundary** in `src/app/ErrorBoundary.tsx` — last resort, sends to Sentry, renders a fatal screen.
- **Per-feature boundary** as the outermost component of each feature's index export. Renders a recoverable error UI; logs to Sentry with the feature tag.

### Async UI patterns

Every server-touching screen has all three states wired:

```tsx
const { data, isPending, error, refetch } = useQuery({
  queryKey: ["wallet", "balance"],
  queryFn: getBalance,
});
if (isPending) return <Skeleton variant="balance" />;
if (error) return <ErrorState onRetry={refetch} message={error.message} />;
return <BalanceCard amount={data.amount} currency={data.currency} />;
```

`Skeleton` and `ErrorState` are shared components in `src/shared/components/`.

## Consequences

**Positive**

- Each feature is portable. Moving a feature to another app is `mv src/features/X` + updating routes.
- Removes the God store.
- Async UX is consistent and predictable.
- Code review can be scoped: a `kyc` PR doesn't touch `wallet` files.

**Negative**

- The migration is non-trivial. ~30 domains × current scattered code = many PRs. We do them feature-by-feature, not in one big bang.
- Two state systems (Zustand + React Query) is more conceptual surface than one. We accept this — they solve different problems.

**Neutral / accept**

- ESLint's `no-restricted-imports` will yell at us during the migration window. Add a deprecation comment + suppression that fails after a date.

## Alternatives considered

1. **Redux Toolkit + RTK Query.** Single state system. Heavier; we don't need Redux's centralised time-travel debugging and we get more boilerplate. Rejected.
2. **React Context for global state.** Re-render storm risk at this scale (balances, transactions, six domains all subscribed to the same root). Rejected.
3. **Server-state-only (no Zustand).** Some state is genuinely client-only (theme, hide-balance toggle, last-viewed currency). Forcing it through the server is wrong. Rejected.

## Rollout

- **PR-A:** scaffold `src/features/`, `src/lib/`, `src/app/`. Move `Button`, `Input`, `Screen`, `Header` into `src/shared/components/`. No feature migrated yet.
- **PR-B:** auth feature migrated end-to-end (since [ADR-0006](0006-auth-secrets.md) needs it).
- **PR-C:** wallet feature migrated end-to-end.
- **PR-D:** kyc feature migrated end-to-end.
- After PR-D: ESLint `no-restricted-imports` becomes an error for cross-feature internal imports. Remaining 27 features migrated in follow-up PRs by their respective owners.

## Revisit when

- The number of cross-feature React Query keys hits a coordination problem (one feature's mutation needs to invalidate multiple features' caches). At that point, introduce a thin event bus on the mobile side too (the same publish/subscribe shape as the backend, but in-process).
