// ESLint flat config — see docs/adr/0003-mobile-architecture.md and 0005-module-structure.md.
// Strictness is path-scoped: new code (apps/api, packages/*, apps/mobile/src/features/*)
// gets the tight rules; legacy mobile code (apps/mobile/app, apps/mobile/src/{components,store,...})
// gets the lenient set until each feature is migrated.

import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/android/**",
      "**/ios/**",
      "**/coverage/**",
      "**/expo-env.d.ts",
      "**/nativewind-env.d.ts",
      "pdf_screenshots/**",
      "pnpm-lock.yaml",
    ],
  },

  // 2. Base recommended + TS recommended (non-type-checked: cheaper, runs without project info)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Defaults for all TS/JS source
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2022 },
    },
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": "off", // handled by unused-imports + @typescript-eslint
      "@typescript-eslint/no-unused-vars": "off", // handled by unused-imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.base.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
        },
        node: true,
      },
    },
  },

  // 4. React + hooks for mobile
  {
    files: ["apps/mobile/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // RN / new JSX transform
      "react/prop-types": "off", // TypeScript handles this
      "react/display-name": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // 5. Legacy mobile paths — most rules drop to warnings until features migrate per ADR-0003.
  {
    files: ["apps/mobile/app/**/*.{ts,tsx}", "apps/mobile/src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "warn",
      "no-empty": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      "import/order": "warn",
    },
  },

  // 6. Strict zone — new code paths enforce module boundaries (ADR-0005).
  {
    files: [
      "apps/api/**/*.ts",
      "packages/**/*.ts",
      "apps/mobile/src/features/**/*.{ts,tsx}",
      "apps/mobile/src/lib/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/modules/*/domain/*",
                "**/modules/*/application/*",
                "**/modules/*/infrastructure/*",
                "**/modules/*/interface/*",
              ],
              message:
                "Import from the module barrel (./index), not internal layers — see ADR-0005.",
            },
            {
              group: [
                "**/features/*/components/*",
                "**/features/*/hooks/*",
                "**/features/*/services/*",
                "**/features/*/store/*",
              ],
              message:
                "Import from the feature barrel (./index), not internal files — see ADR-0003.",
            },
          ],
        },
      ],
    },
  },

  // 7. Config files — allow CJS, relax some rules
  {
    files: ["**/*.config.{js,cjs,mjs,ts}", "**/babel.config.js", "**/metro.config.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
    },
  },
);
