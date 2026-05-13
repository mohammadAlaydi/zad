# ADR-0002: Monorepo layout — pnpm workspaces

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Engineering
- **Tags:** ops, mobile, backend

## Context

The brief requires sharing Zod schemas between frontend and backend. The repo today is a single Expo app at the root. We need to add a backend (`apps/api`) and shared packages without breaking the existing mobile build (Metro is deeply opinionated about resolution).

Audit reference: [audit §1, §3 (S1-6)](../audit.md).

## Decision

**pnpm workspaces. Three workspace roots: `apps/*`, `packages/*`, and the existing local fork at `packages/react-native-worklets/`.**

Final layout:

```
/
├── apps/
│   ├── mobile/               # existing Expo app, moved here as-is
│   └── api/                  # new Fastify backend
├── packages/
│   ├── shared-types/         # cross-cutting types (Money, IDs, enums)
│   ├── shared-validation/    # Zod schemas consumed by both apps
│   ├── shared-errors/        # AppError hierarchy, Result type
│   └── react-native-worklets/  # existing local fork, untouched
├── docs/                     # this directory
├── .github/workflows/        # CI
├── pnpm-workspace.yaml
├── package.json              # workspace root only — no app deps
└── tsconfig.base.json        # shared compiler options
```

- Package manager: **pnpm** (strict, disk-efficient, deterministic phantom-dep handling). Node version pinned via [`.nvmrc`](../../.nvmrc) to **20 LTS**.
- TypeScript references: `tsconfig.base.json` at the root with `composite: false` for app workspaces but `composite: true` for `packages/*` so they can be built once and consumed as compiled `.d.ts`. Metro consumes packages as **source** (via `metro.config.js` `watchFolders` + `nodeModulesPaths`) to keep hot-reload fast.
- Mobile-specific: the existing local fork at [packages/react-native-worklets/](../../packages/react-native-worklets/) stays put; pnpm will resolve it because it's already a workspace member. The `"file:./packages/react-native-worklets"` line in [package.json:50](../../package.json:50) becomes a workspace protocol (`"workspace:*"`) after the move.
- Shared packages publish nothing to npm — consumed via `workspace:*`.

### Path aliases

- Existing `@/*` → `apps/mobile/src/*` (carried through the move).
- New `@zadpay/types`, `@zadpay/validation`, `@zadpay/errors` for the shared packages.

## Consequences

**Positive**
- Single source of truth for `Money`, request/response schemas, error codes.
- Refactoring an API contract changes both ends in one PR; type errors light up immediately.
- Independent CI for `apps/mobile` and `apps/api` (different toolchains, different runners).

**Negative**
- The move from flat repo → monorepo is a single mechanical PR (file moves + Metro/Babel/TS path updates). Real risk of breaking the existing mobile build during the move. Mitigation: do it in one PR, with a checklist; verify `expo start` boots before merging.
- Metro is notoriously fussy about pnpm symlinks. We will likely need a custom `metro.config.js` that calls `pnpm`'s `node-linker=hoisted` mode for the mobile workspace, or sets `extraNodeModules`. This is well-trodden territory (Expo docs cover it).

**Neutral / accept**
- We do not adopt Nx or Turborepo. The dependency graph is two apps + three tiny packages; native pnpm scripts + GitHub Actions caching are enough. If the graph grows past ~6 packages, revisit.

## Alternatives considered

1. **npm workspaces.** Fine for two apps + small packages. Loses pnpm's correctness guarantees and disk efficiency. Marginal advantage: less Metro-symlink risk. Net: not enough win to forgo pnpm.
2. **Yarn Berry with PnP.** Strict resolution. PnP and Metro have an unhappy history (Expo support for PnP is partial). Rejected on operational risk.
3. **Two separate repos** (`zadpay-mobile`, `zadpay-api`). Loses cross-language type sharing — the central reason the brief calls for shared Zod schemas. Rejected.
4. **Nx / Turborepo.** Real win at >10 packages with caching. At this scale, ceremony exceeds value. Rejected for now.

## Rollout

PR-0 (the first PR after this ADR is approved):
1. Create `pnpm-workspace.yaml`.
2. Move existing repo contents into `apps/mobile/` preserving git history (`git mv`).
3. Update [metro.config.js](../../metro.config.js) `watchFolders` + `resolver.nodeModulesPaths`.
4. Update [tsconfig.json](../../tsconfig.json) to extend `tsconfig.base.json`; update `paths`.
5. Update [babel.config.js](../../babel.config.js) — `babel-preset-expo` already handles workspace paths if the project root is set correctly via `EXPO_ROOT_DIR`.
6. Update [eas.json](../../eas.json) `cli.appVersionSource` and add `build.*.cwd` to point at `apps/mobile`.
7. Smoke test: `pnpm --filter @zadpay/mobile start` boots; `pnpm --filter @zadpay/mobile run android` builds.

Add `packages/shared-*` empty in PR-0; populate in subsequent PRs as each shared schema is needed.

## Revisit when

- The number of workspace packages exceeds ~8 and full-graph rebuilds are slow → adopt Turborepo with remote cache.
- A second mobile app appears (e.g. a merchant-facing app) → consider extracting `packages/ui` from the current shared components.
