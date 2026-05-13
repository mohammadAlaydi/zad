export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix --max-warnings=999", "prettier --write"],
  "*.{json,yaml,yml,md,css}": ["prettier --write"],
};
