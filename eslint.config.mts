import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "public", "backend/dist"],
  },

  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  unicorn.configs.recommended,

  // === Frontend (src/) ===
  {
    files: ["src/**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Only for front
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["vite.config.ts", "eslint.config.mts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      "unicorn/no-null": "error",
    },
  },

  {
    files: ["src/services/**/*.ts"],
    rules: {
      "unicorn/no-null": "off",
    },
  },

  // === Test Overrides ===
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "max-lines-per-function": "off",
    },
  },

  // === Backend (backend/src/) ===
  {
    files: ["backend/src/**/*.{ts,js}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./backend/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "off",
      "unicorn/no-null": "off",
      "max-lines-per-function": "off",
      "no-undef": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "unicorn/prefer-module": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  eslintPluginPrettierRecommended,
);
