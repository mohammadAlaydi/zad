# ADR-0001: Platform target — mobile-first, drop web-app targets

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** mobile

## Context

The original brief specified web-app production targets (Lighthouse 95+, <200 KB gzipped initial JS, service workers, CSP, WebP/AVIF, DOMPurify, httpOnly cookies for auth). The repo is an **Expo SDK 51 / React Native 0.74** application. `react-native-web` is configured in [package.json](package.json) and [app.json:45-48](app.json:45-48), but no marketing, no SEO, no analytics events, and no product flow treats the web export as a first-class surface. The user-facing product is iOS + Android.

Optimising the native app to web-specific metrics would either be no-ops (CSP, DOMPurify, service workers don't apply on native) or pull architecture in the wrong direction (httpOnly cookies are wrong on mobile — Keychain/Keystore is the right place for tokens).

Audit reference: see [audit §1, §5](../audit.md).

## Decision

**The product is a mobile app. Web is throwaway.**

- The user-facing build matrix is **iOS (App Store) + Android (Play Store)** via EAS Build.
- `react-native-web` and `expo start --web` stay in the repo as a dev convenience (faster preview of pure-UI changes in a browser) but are **not in CI**, **not in release artefacts**, and **not in the perf budget**.
- The brief's web-only targets are replaced with the mobile targets in [audit §5](../audit.md#5-production-targets-revised-for-react-native):
  - Cold start (TTI) < 2.0 s on Pixel 4a
  - Release APK < 80 MB universal, < 35 MB per-ABI
  - Release IPA < 70 MB
  - Hermes bytecode < 6 MB
  - Crash-free sessions > 99.5%
- Brief items explicitly dropped and replaced with mobile equivalents:

| Dropped (web)                     | Replaced with (mobile)                                                                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse 95+ perf score         | Cold-start TTI + JS frame budget                                                                                                                                                                                     |
| <200 KB gzipped initial JS        | Hermes bytecode + APK/IPA size                                                                                                                                                                                       |
| Service worker for offline        | React Query persisted cache + AsyncStorage + retry-with-backoff service layer                                                                                                                                        |
| WebP/AVIF + `srcset`              | `expo-image` with `cachePolicy="memory-disk"` + native-resolution `@2x`/`@3x` assets                                                                                                                                 |
| CSP / unsafe-inline / unsafe-eval | TLS cert pinning + `react-native-ssl-pinning` (or `expo-network` + manual pinning) on the API client                                                                                                                 |
| DOMPurify                         | RN renders text, not HTML — for the rare `WebView` (e.g. learn content), set `originWhitelist={['https://*']}` and `sandbox`                                                                                         |
| httpOnly cookies for auth         | `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android) for refresh token + Authorization header for access token                                                                               |
| WCAG 2.1 AA                       | React Native a11y APIs: `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, dynamic type scaling, RTL parity for `ar` locale; tested in Accessibility Scanner (Android) + Accessibility Inspector (iOS) |

## Consequences

**Positive**

- Engineering effort aligns with the real product surface; no thrash on web-only metrics.
- Token-storage and CSP debates resolved at the platform level once, not per feature.
- Smaller CI matrix; faster signal.

**Negative**

- If the business later wants a marketing web SPA or merchant web dashboard, that is a **separate project**, not a re-target of this repo. (Likely the right separation anyway — different domains, different perf budgets, different SEO needs.)
- We don't get the "type your link to share" UX of a PWA. Accept this trade.

**Neutral / accept**

- Deep linking via `expo-linking` is mobile-only. The web export will not handle universal links.
- Accessibility tooling differs: axe-core is replaced with platform a11y inspectors. CI gating shifts to manual a11y review on critical flows + linter rules (`eslint-plugin-react-native-a11y` not yet stable; use the `react-native` plugin's a11y rules).

## Alternatives considered

1. **Mobile + web as first-class.** Doubles a11y testing, doubles perf budgeting, forces RN compatibility constraints on every dependency choice (some RN libs have no `react-native-web` shim). Net: 30–40% effort overhead for a surface that isn't the product. Rejected.
2. **Pivot to a web-only Next.js SPA, RN as a reference.** The largest scope of any option. The mobile app is already feature-rich and works; throwing it away to satisfy the brief verbatim would be a poor trade-off. Rejected.

## Rollout

- This ADR is the gate.
- In a follow-up PR, remove `react-native-web` and `react-dom` from `package.json` if we want to eliminate the web target entirely. **For now we keep them** — they cost nothing at build time for native and are useful for component-level dev previews.
- CI configured for native builds only (see [ADR-0010](0010-cicd.md)).

## Revisit when

- The business commits to a public-facing web product (marketing site, merchant dashboard, customer self-service portal). At that point, spin up a separate `apps/web` workspace with Next.js or Remix — do not retarget this repo.
