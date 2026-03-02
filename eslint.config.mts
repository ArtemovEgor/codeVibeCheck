import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "public"],
  },

  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  unicorn.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["vite.config.ts", "eslint.config.ts"],
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
      "unicorn/no-null": "off", // Disabling for services to allow API requests that require null
    },
  },

  eslintPluginPrettierRecommended,
);
