# syntax=docker/dockerfile:1.7
# Multi-stage build per ADR-0010. Final image is distroless, non-root, < 150 MB.

# ── build ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages packages
RUN pnpm install --frozen-lockfile --filter '@zadpay/api...' --ignore-scripts
COPY apps/api apps/api
RUN pnpm --filter @zadpay/api exec prisma generate
RUN pnpm --filter @zadpay/api run build

# ── prune ──────────────────────────────────────────────────────────────
# Production-only dependency tree. --ignore-scripts skips postinstall
# (prisma generate already ran in build stage).
FROM node:20-alpine AS prune
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /repo
COPY --from=build /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=build /repo/apps/api/package.json apps/api/
COPY --from=build /repo/packages packages
RUN pnpm install --frozen-lockfile --prod --filter '@zadpay/api...' --ignore-scripts

# ── final ──────────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS final
WORKDIR /app
COPY --from=prune /repo/node_modules /app/node_modules
COPY --from=prune /repo/apps/api/node_modules /app/apps/api/node_modules
COPY --from=prune /repo/packages /app/packages
COPY --from=build /repo/apps/api/dist /app/apps/api/dist
COPY --from=build /repo/apps/api/prisma /app/apps/api/prisma
ENV NODE_ENV=production
USER nonroot
EXPOSE 3000
CMD ["apps/api/dist/server.js"]
