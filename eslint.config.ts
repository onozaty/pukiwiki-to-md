import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    ignores: ["src/generated/**"], // orval generated file
  },
  {
    files: ["**/*.test.ts"],
    plugins: {
      // @ts-expect-error - vitest plugin types are not compatible with ESLint v9 flat config
      // See: https://github.com/vitest-dev/eslint-plugin-vitest/issues/761
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
]);
