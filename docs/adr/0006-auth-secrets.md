# ADR-0006: Auth, tokens, secrets, secure storage

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** backend, mobile, security

## Context

Today the app stores `isAuthenticated: boolean` in AsyncStorage ([src/store/appStore.ts:507](../../src/store/appStore.ts:507)) — trivially tampered. No real auth, no token, no rotation, no replay protection, no secrets configuration. We are adding all of it.

Audit reference: [audit §3 S0-2, S0-5, §4](../audit.md).

## Decision

### Token model

- **Access token (JWT, 15 min):** signed with **EdDSA / Ed25519** (faster than RS256, smaller than RSA, modern). Carries `sub` (user ID), `kyc_status`, `roles`, `iat`, `exp`, `jti`. Stateless verification; revocation handled via short TTL + refresh denylist.
- **Refresh token (opaque, 7 days):** random 32-byte token. Server stores `{tokenHash (argon2id), userId, deviceId, family, expiresAt, revokedAt}` in `identity.refresh_tokens`. **One-time-use** with **rotation**:
  - Each refresh issues a new refresh token and **revokes the old one**.
  - The old token's `family` ID flows through to the new token.
  - **Replay detection:** if a revoked refresh token is presented, **revoke the entire family** (all tokens that share the family ID) and force re-login. Sentry alert fires.
- **Token storage on device:**
  - Access token: in memory only (Zustand non-persisted slice). Never written to disk.
  - Refresh token: `expo-secure-store` (Keychain on iOS with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; EncryptedSharedPreferences on Android with `accessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`).
  - On app launch: read refresh token from SecureStore → exchange for access → in-memory.
  - On logout: explicit delete from SecureStore + server-side family revocation.

### Mobile auth session shape

```ts
// src/features/auth/store/authStore.ts
type AuthSession = {
  accessToken: string;          // in memory only, never persisted
  expiresAt: number;            // ms epoch
  userId: string;
  kycStatus: 'pending' | 'submitted' | 'review' | 'approved' | 'rejected';
  roles: string[];
};
```

Refresh state is **not** in Zustand. It is owned by the API client's interceptor:

```ts
// src/lib/api/refreshInterceptor.ts
let refreshInFlight: Promise<string> | null = null;

api.onUnauthorized(async (originalRequest) => {
  refreshInFlight ??= refreshAccessToken();      // single-flight
  try {
    const newAccess = await refreshInFlight;
    return api.retry(originalRequest, { accessToken: newAccess });
  } finally {
    refreshInFlight = null;
  }
});
```

Single-flight prevents 5 parallel requests from triggering 5 refresh calls (which would revoke each other under one-time-use rotation).

### Biometric unlock

- `expo-local-authentication` for prompt.
- Biometric **does not** replace the password — it gates re-entry into the app when a refresh token is already present. The refresh token itself stays in SecureStore behind the device's own biometric/passcode gate.
- After 5 failed biometric attempts → force full re-login.
- A 30-day refresh-token rotation forces periodic biometric re-prompt regardless.

### Authorization (RBAC)

- Roles: `customer`, `merchant`, `agent`, `admin`. Encoded in the access token's `roles` claim.
- **Permission checks happen at the use-case layer**, not in the route. Reason: a use case is the smallest unit of business behavior; route-level checks miss internal calls and are bypassable by feature flags. Routes still set a coarse-grained `preHandler` that requires authentication, but fine-grained permission is `if (!user.can('wallet:transfer')) return err(Forbidden)` inside the command.
- Permissions catalog (Phase 1):
  - `identity:self:read`, `identity:self:write`
  - `kyc:self:submit`, `kyc:self:read`
  - `wallet:self:read`, `wallet:self:transfer`, `wallet:self:topup`
  - `admin:*` (admins inherit narrower scopes via role mapping, not wildcard at runtime)

### Password policy

- Hashed with `argon2id` (`@node-rs/argon2`), parameters `m=19456, t=2, p=1` (OWASP).
- Min length 10; check against the rockyou.txt-derived banned list (`have-i-been-pwned` k-anonymity API in the background, non-blocking for UX, but soft-rejects in the form).
- No periodic rotation (NIST SP 800-63B aligned).

### Secrets management

- All secrets via environment variables. Validated at startup with **Zod** in `apps/api/src/infra/config/env.ts`:

  ```ts
  export const env = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    JWT_SIGNING_KEY: z.string().min(32),     // ed25519 private key, base64
    JWT_VERIFY_KEY: z.string().min(32),      // ed25519 public key, base64
    REFRESH_TOKEN_PEPPER: z.string().min(32),
    SUMSUB_API_KEY: z.string().optional(),   // present in non-dev
    SUMSUB_API_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    OTLP_ENDPOINT: z.string().url().optional(),
  }).superRefine((v, ctx) => {
    if (v.NODE_ENV === 'production' && !v.SUMSUB_API_KEY) ctx.addIssue({ /* ... */ });
  }).parse(process.env);
  ```

- **App refuses to start** if validation fails. No env, no boot.
- Production secret source: cloud-provider secret manager (AWS Secrets Manager, GCP Secret Manager, Vault). Injected as env vars at container start. **Never** baked into the image.
- Local dev: `.env.local` (in `.gitignore`, also added below). `.env.example` checked in with placeholder values.
- Mobile EAS secrets: `EAS_API_BASE_URL` per profile (dev / preview / production) via `eas secret` + read at runtime via `expo-constants` `expoConfig.extra`.

### Audit log

A separate **append-only** table `shared.audit_log`:

```
id           uuid pk
ts           timestamptz default now()
actor_id     uuid             -- who did it
actor_role   text             -- role at time of action
action       text             -- 'login.success', 'password.change', 'role.change', 'kyc.approve', 'wallet.transfer'
target_id    uuid nullable    -- entity affected
ip           inet nullable
user_agent   text nullable
request_id   uuid             -- correlates with structured logs
metadata     jsonb            -- action-specific details
```

- All security-sensitive actions write a row in the **same transaction** as the action itself (no orphans).
- Postgres `REVOKE UPDATE, DELETE ON shared.audit_log FROM api_app` — the app user can `INSERT` only.
- Retention: 7 years (regulatory baseline; configurable per market).

### Updates to .gitignore

```
# Local env files
.env
.env.local
.env.*.local
apps/api/.env
apps/api/.env.local
apps/mobile/.env
apps/mobile/.env.local
```

The current [.gitignore](../../.gitignore) already covers `.env*.local` — extend to be explicit per workspace.

## Consequences

**Positive**
- AsyncStorage tampering cannot impersonate a user (refresh token is in Keychain, server validates).
- Replay attacks against refresh tokens detected and contained.
- Secrets bound to environment, never to image.
- Audit log is admissible evidence.

**Negative**
- Single-flight refresh adds complexity. Test coverage is mandatory on the interceptor.
- Argon2id raises CPU per login by ~50–150 ms. Acceptable; logins are not in the hot path.

**Neutral / accept**
- Ed25519 is well-supported by `jose` and modern verifiers, less so by some legacy systems. We don't have legacy systems.
- We use `accessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` on Android — refresh tokens become inaccessible until the device is first unlocked after boot. Trade-off: no background-refresh on a freshly-rebooted device until the user unlocks. Right trade for fintech.

## Alternatives considered

1. **Long-lived JWTs (no refresh).** Simpler. Can't revoke without a denylist; can't shorten effective TTL. Rejected for fintech.
2. **OAuth / OpenID Connect via Auth0/Cognito.** Solid choice; introduces a vendor in the auth path. We keep the option open via a hexagonal `IdentityProvider` port — swap in Auth0 by implementing the port without changing the use cases.
3. **Sliding-session cookies.** Web-style. Wrong tool for native; we don't have a browser to manage cookies.
4. **bcrypt over argon2id.** Acceptable, less modern. Default to argon2id; bcrypt is the fallback if a target market mandates FIPS-validated implementations only.

## Rollout

- PR-3: `identity` module skeleton + `POST /v1/auth/login`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`, `GET /v1/identity/me`. Argon2id, JWT, refresh table.
- PR-4: Mobile auth feature migration to feature-folder + SecureStore + refresh interceptor + nav guard rewrite + biometric unlock.
- Audit log table + middleware lands in PR-2 (alongside the module scaffolding) so every subsequent command has it.

## Revisit when

- We add SSO for B2B merchants → introduce OIDC via the `IdentityProvider` port.
- A market requires FIPS-validated crypto → swap argon2id for the FIPS bcrypt implementation; key algorithm becomes RS256.
- Token theft incidents in production telemetry → consider DPoP or short-lived bearer + sender-constrained tokens.
