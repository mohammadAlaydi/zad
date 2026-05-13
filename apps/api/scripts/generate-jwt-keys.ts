// One-shot dev helper. Generates an Ed25519 key pair + a refresh-token pepper,
// prints env-friendly lines on stdout. Pipe into .env:
//   pnpm --filter @zadpay/api run keygen >> .env
//
// In production these come from a secret manager, never from this script.

import { randomBytes } from "node:crypto";
import { exportPKCS8, exportSPKI, generateKeyPair } from "jose";

async function main(): Promise<void> {
  const { privateKey, publicKey } = await generateKeyPair("EdDSA", {
    crv: "Ed25519",
    extractable: true,
  });
  const privatePem = await exportPKCS8(privateKey);
  const publicPem = await exportSPKI(publicKey);
  const pepper = randomBytes(32).toString("hex");

  process.stdout.write(`JWT_SIGNING_KEY="${privatePem}"\n`);
  process.stdout.write(`JWT_VERIFY_KEY="${publicPem}"\n`);
  process.stdout.write(`REFRESH_TOKEN_PEPPER=${pepper}\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(`generate-jwt-keys failed: ${String(err)}\n`);
  process.exit(1);
});
