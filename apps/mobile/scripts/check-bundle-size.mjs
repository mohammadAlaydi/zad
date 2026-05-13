#!/usr/bin/env node
// Bundle-size CI gate per ADR-0010 / docs/audit.md §5.
//
// `expo export --platform android` produces the unbundled JS at
// dist/_expo/static/js/android/index-<hash>.js. EAS Build then runs hermesc
// over it to produce the on-device bytecode; that step needs the full
// Android toolchain so it doesn't run in our PR CI. We use the raw JS
// bundle size as the budget (Hermes compresses by ~30–50%, so a 6 MB raw
// JS budget keeps the Hermes target around 3–4 MB — comfortably under the
// ADR-0010 6 MB Hermes ceiling).

import { execSync } from "node:child_process";
import { readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");

const RAW_JS_BUDGET_BYTES = 6 * 1024 * 1024; // 6 MB raw JS ≈ < 4 MB Hermes

function fail(msg) {
  process.stderr.write(`bundle-size: ${msg}\n`);
  process.exit(1);
}

function fmt(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}

function walkJsBundles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walkJsBundles(full));
      continue;
    }
    if (e.isFile() && e.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const distDir = join(mobileRoot, "dist");
  rmSync(distDir, { recursive: true, force: true });

  process.stdout.write("bundle-size: running `expo export --platform android`…\n");
  execSync("pnpm exec expo export --platform android --no-source-maps", {
    cwd: mobileRoot,
    stdio: "inherit",
  });

  const jsRoot = join(distDir, "_expo", "static", "js", "android");
  let totalBytes = 0;
  const bundles = walkJsBundles(jsRoot);
  if (bundles.length === 0) {
    fail(`no JS bundles found under ${jsRoot}`);
  }
  for (const file of bundles) {
    const size = statSync(file).size;
    totalBytes += size;
    process.stdout.write(`  ${file.replace(mobileRoot + "/", "")}  ${fmt(size)}\n`);
  }
  process.stdout.write(
    `bundle-size: total ${fmt(totalBytes)} (budget ${fmt(RAW_JS_BUDGET_BYTES)})\n`,
  );

  if (totalBytes > RAW_JS_BUDGET_BYTES) {
    fail(
      `over budget — investigate with \`pnpm exec source-map-explorer dist/_expo/static/js/android/*.js\``,
    );
  }
  process.stdout.write("bundle-size: ok\n");
}

main();
