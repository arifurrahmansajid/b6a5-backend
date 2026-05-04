import eslintRecommended from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  // Base JS recommended rules
  eslintRecommended.configs.recommended,

  // TypeScript strict rules
  ...(tsEslint.configs.recommended.rules
    ? [tsEslint.configs.recommended] // spread if needed
    : []),

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node, // Node.js globals like console, process
        console: "readonly", // explicitly allow console
      },
    },
    plugins: {
      import: importPlugin,
      "@typescript-eslint": tsEslint,
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" }, // handle path aliases
      },
    },
    rules: {
      // TypeScript rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // Code safety
      "no-console": ["warn", { allow: ["warn", "error", "info"] }], // allow common console methods
      "no-debugger": "error",
      eqeqeq: "error",
      curly: "error",

      // Imports
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",

      // Clean code
      "no-trailing-spaces": "error",
      "eol-last": "error",
      "object-shorthand": "error",
      "prefer-const": "error",

      // Quote style
      quotes: ["error", "double"],
    },
  },

  {
    // Prettier overrides
    rules: {
      ...prettierConfig.rules,
    },
  },
]);
