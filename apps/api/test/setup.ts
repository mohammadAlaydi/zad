// Vitest setup file — runs before each test file's modules are loaded.
// We populate the env so anything that imports env.ts (transitively or not)
// can boot. Use-case-level unit tests don't actually need most of these,
// but route-level / integration tests will.

import { exportPKCS8, exportSPKI, generateKeyPair } from "jose";

const { privateKey, publicKey } = await generateKeyPair("EdDSA", {
  crv: "Ed25519",
  extractable: true,
});

process.env["NODE_ENV"] = "test";
process.env["JWT_SIGNING_KEY"] = await exportPKCS8(privateKey);
process.env["JWT_VERIFY_KEY"] = await exportSPKI(publicKey);
process.env["REFRESH_TOKEN_PEPPER"] = "test-pepper-must-be-at-least-32-characters-long";
process.env["ACCESS_TOKEN_TTL_SECONDS"] = "900";
process.env["REFRESH_TOKEN_TTL_SECONDS"] = "604800";
process.env["DATABASE_URL"] ??= "postgresql://test:test@localhost:5432/test";
process.env["REDIS_URL"] ??= "redis://localhost:6379";
process.env["LOG_LEVEL"] = "warn";
