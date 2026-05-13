# End-to-end testing

Maestro flows live under [e2e/maestro/](../e2e/maestro/). They drive the
mobile app through real screens against a real (or staging) backend.
Reference: ADR-0010 (CI/CD).

## Flows

| File                                                  | Acceptance                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [login.yaml](../e2e/maestro/login.yaml)               | An existing user signs in via /(auth)/email-login and lands on home or kyc-status.           |
| [register-kyc.yaml](../e2e/maestro/register-kyc.yaml) | Fresh user → register → upload docs → submit → InMemoryKycProvider auto-approves → home.     |
| [topup-stub.yaml](../e2e/maestro/topup-stub.yaml)     | The add-card screen is the PCI-safe placeholder (audit S0-1); no PAN/CVV inputs are present. |
| [send.yaml](../e2e/maestro/send.yaml)                 | The send entry screen renders. Full transfer flow lands when `app/send/*` migrates.          |
| [receive.yaml](../e2e/maestro/receive.yaml)           | The receive screen renders. Real account binding lands with the receive migration.           |

## Running locally

```bash
# 1. Install Maestro
curl -sL https://get.maestro.mobile.dev | bash
export PATH="$PATH:$HOME/.maestro/bin"

# 2. Bring up the backend + an Android emulator (or a connected iOS device)
docker compose up -d postgres redis
pnpm --filter @zadpay/api run dev
emulator -avd Pixel_4a_API_33 &

# 3. Build + install the dev client
pnpm --filter @zadpay/mobile run android

# 4. Seed test credentials (login.yaml expects an existing user)
export MAESTRO_EMAIL="test@example.com"
export MAESTRO_PASSWORD="strong-pass-123"

# 5. Run all flows
pnpm --filter @zadpay/mobile run e2e

# Or one flow:
maestro test e2e/maestro/register-kyc.yaml
```

## CI

The [mobile-bundle-size](../.github/workflows/ci.yml) job runs on every PR
that touches `apps/mobile/` or `packages/`. It runs `expo export` and
fails if the total Android JS bundle exceeds the budget in
[check-bundle-size.mjs](../apps/mobile/scripts/check-bundle-size.mjs).

The `mobile-e2e` job is checked in but commented out — it needs an
Android emulator runner and an EAS preview APK URL. PR-15 (release
pipeline) wires the dependency on the EAS build and enables the job.

## Bundle-size budget rationale

ADR-0010 sets the budget at **6 MB Hermes bytecode**. We don't run
`hermesc` in PR CI (that needs the full Android SDK), so the
implementation uses **6 MB raw JS bundle** as a proxy. Hermes compresses
JavaScript by 30–50%, so the effective Hermes-equivalent budget is
~3–4 MB — comfortably under the ADR ceiling. When the EAS build runs in
PR-15's release pipeline, we can swap the check for the real `.hbc`
size.
