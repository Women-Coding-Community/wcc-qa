import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
      "playwright/.cache/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts", "helpers/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/no-skipped-test": "off",
    },
  },
  {
    // The setup project logs roles in and saves storageState; it has no assertions by design.
    files: ["tests/admin/setup.ts"],
    rules: {
      "playwright/expect-expect": "off",
    },
  },
  prettier,
];
