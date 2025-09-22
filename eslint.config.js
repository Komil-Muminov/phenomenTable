import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      root: true,
      env: {
        browser: true,
        es2020: true,
      },
      ignorePatterns: [
        "dist",
        ".eslintrc.cjs",
        "postcss.config.js",
        "lint-staged.config.js",
      ],
      extends: ["plugin:import/typescript"],
      parser: "@typescript-eslint/parser",
      plugins: [
        "@typescript-eslint",
        "react-refresh",
        "unused-imports",
        "import",
      ],
      rules: {
        "@typescript-eslint/no-duplicate-enum-values": "off",
        "import/order": [
          "error",
          {
            groups: [
              "external",
              "builtin",
              "internal",
              "parent",
              "sibling",
              "index",
              "object",
              "type",
            ],
            "newlines-between": "always",
            pathGroupsExcludedImportTypes: ["internal"],
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],
        quotes: [1, "single"],
        "no-console": [1],
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
      overrides: [
        {
          files: ["src/shared/**/*.{js,jsx,ts,tsx}"],
          rules: {
            "no-restricted-imports": "off",
          },
        },
      ],
    },
  }
);
