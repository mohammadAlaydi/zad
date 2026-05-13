# Deployment

ADR-0010 sets the policy; this doc is the operational reference. Two
release pipelines:

- [api-release.yml](../.github/workflows/api-release.yml) — Docker build → GHCR → staging → prod (manual gate).
- [mobile-release.yml](../.github/workflows/mobile-release.yml) — EAS build → source-maps → store submission (manual gate).

## API pipeline

Triggers on push to `main` touching `apps/api/**`, `packages/**`, or
`pnpm-lock.yaml`. Stages:

| #   | Job                   | Notes                                                                                                                                           |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `build`               | Multi-stage Dockerfile from PR-2. Pushes `ghcr.io/<org>/zadpay-api:sha-<12>` and `:latest`. Uses GHCR build cache.                              |
| 2   | `deploy-staging`      | POSTs `{ "image": "sha-<12>" }` to `STAGING_DEPLOY_HOOK`. Replace with kubectl/argocd/flyctl as appropriate.                                    |
| 3   | `smoke-staging`       | `curl /health/ready` up to 12× / 5 s spacing.                                                                                                   |
| 4   | `promote-production`  | GitHub environment `production` — required reviewers gate. Re-tags the image as `prod-<sha>` + `prod`, then calls the prod deploy webhook.      |
| 5   | `smoke-production`    | Same smoke check against prod.                                                                                                                  |
| 6   | `rollback-production` | Only runs on smoke failure. Webhook receives `{ "image": "prod-previous" }`; cluster decides what that means (your controller should track it). |

### Required GitHub secrets

| Secret                    | Used by                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- |
| `STAGING_DEPLOY_HOOK`     | URL the staging cluster listens on                                                |
| `STAGING_DEPLOY_TOKEN`    | Bearer token for that hook                                                        |
| `STAGING_BASE_URL`        | Optional override for smoke target (default `https://api-staging.zadpay.example`) |
| `PRODUCTION_DEPLOY_HOOK`  | Prod cluster deploy webhook                                                       |
| `PRODUCTION_DEPLOY_TOKEN` | Bearer token                                                                      |
| `PRODUCTION_BASE_URL`     | Optional override                                                                 |
| `GITHUB_TOKEN`            | Auto-provided; gives image push permissions when `packages: write` is set         |

### Required GitHub environments

Create under `Settings → Environments`:

- `staging` — optional reviewers (auto-deploy is fine).
- `production` — **required reviewers**. Two-person rule recommended.

### Application-side env in production

The container needs these via the cluster's secret manager — never baked
into the image:

```
NODE_ENV=production
DATABASE_URL=postgresql://…?schema=public
REDIS_URL=redis://…
JWT_SIGNING_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----"
JWT_VERIFY_KEY="-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----"
REFRESH_TOKEN_PEPPER=…  (>= 32 chars)
SENTRY_DSN=https://…@sentry.io/…
CORS_ORIGINS=https://app.zadpay.example
METRICS_ALLOWLIST=10.0.0.0/8   (or your Prometheus pod IPs)
```

The Zod schema in `apps/api/src/infra/config/env.ts` refuses to boot if
any of these are missing in `NODE_ENV=production`.

## Mobile pipeline

Triggers:

- Push to `main` with mobile changes → **preview** profile (internal distribution).
- Tag `mobile-v*` → **production** profile + source-maps + store submission.

| #   | Job                 | Notes                                                                                                                                                |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `resolve-profile`   | preview / production decision                                                                                                                        |
| 2   | `eas-build`         | iOS + Android. Uses [eas.json](../apps/mobile/eas.json) `production` profile. `--no-wait` so the workflow doesn't block; EAS notifies on completion. |
| 3   | `upload-sourcemaps` | Production only. `expo export --dump-sourcemap` + Sentry CLI.                                                                                        |
| 4   | `submit-ios`        | Manual gate via `ios-store` environment. `eas submit` → TestFlight.                                                                                  |
| 5   | `submit-android`    | Manual gate via `android-store` environment. `eas submit --track internal`.                                                                          |

### Required GitHub secrets

| Secret                  | Used by                 |
| ----------------------- | ----------------------- |
| `EXPO_TOKEN`            | EAS Build / Submit auth |
| `SENTRY_AUTH_TOKEN`     | Sentry CLI upload       |
| `SENTRY_ORG`            | Sentry org slug         |
| `SENTRY_PROJECT_MOBILE` | Sentry project slug     |

### Required GitHub environments

- `mobile-preview` — optional reviewers.
- `mobile-production` — required reviewers.
- `ios-store` — required reviewers + Apple-side credentials in EAS.
- `android-store` — required reviewers + Play Console service account in EAS.

### EAS-side credentials

Configured once via `eas credentials`:

- iOS: Apple distribution certificate + provisioning profile + ASC app id.
- Android: Upload keystore + Play Service Account JSON.

[eas.json](../apps/mobile/eas.json) references these by name; EAS stores
them centrally for the project.

### Cutting a mobile release

```bash
# 1. Bump version on main
cd apps/mobile
npm version 1.2.3   # updates package.json + app.json version
git add . && git commit -m "release(mobile): v1.2.3"
git tag mobile-v1.2.3
git push origin main mobile-v1.2.3
# 2. Watch the mobile-release workflow on GitHub. Two human gates
#    (ios-store + android-store) trigger before submission.
# 3. After TestFlight + Play Internal go green, promote to public tracks
#    through ASC / Play Console UI — those steps are intentionally not
#    automated.
```

## Rollback runbook

### API

The smoke check after prod deploy auto-rolls back via the
`prod-previous` magic tag. Manual rollback:

```bash
TAG=prod-sha-abc12345                          # whichever was last green
curl -X POST "$PRODUCTION_DEPLOY_HOOK" \
  -H "Authorization: Bearer $PRODUCTION_DEPLOY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"$TAG\"}"
```

### Mobile

You can't actually roll back a store submission — Apple/Google control
publish state. Mitigations:

- **TestFlight build pulled** before promote: just don't promote.
- **Crash burst in production after promote**: in App Store Connect /
  Play Console, halt the staged rollout (Android: pause the production
  track; iOS: remove from sale temporarily). Then push a hotfix mobile
  release at a higher version.
- **EAS Update OTA** for JS-only fixes: an emergency `eas update` push
  with a fixed JS bundle gets to users in minutes without a store
  resubmission. Schema/native changes still need a store release.

## Bundle-size budget

The [mobile-bundle-size](../.github/workflows/ci.yml) job from PR-14 runs
on every mobile PR and fails when the raw JS bundle exceeds 6 MB (≈
3–4 MB Hermes — under the ADR-0010 6 MB Hermes ceiling). When PR-15's
release pipeline produces a real EAS build, swap the proxy for the actual
`.hbc` size from the build artefacts.
