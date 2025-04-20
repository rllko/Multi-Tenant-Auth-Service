import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ESLint recommended configuration.
  js.configs.recommended,

  // TanStack Query ESLint recommended configuration.
  ...pluginQuery.configs["flat/recommended"],

  // TanStack Router ESLint recommended configuration.
  ...pluginRouter.configs["flat/recommended"],

  // TypeScript ESLint recommended configuration.
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },

  // React ESLint recommended configuration.
  {
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    rules: {
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          reservedFirst: true,
          multiline: "last",
        },
      ],
    },
  },

  // Project configuration.
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React hooks ESLint recommended configuration.
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },

  // Import/export sort ESLint configuration.
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          // The default grouping, but with type imports first in each group.
          groups: [
            // Side effect imports.
            ["^\\u0000"],
            // Node.js builtins prefixed with `node:`.
            ["^node:.*\\u0000$", "^node:"],
            // React and React DOM imports.
            [
              "^react.*\\u0000$",
              "^react",
              "^react-dom.*\\u0000$",
              "^react-dom",
            ],
            // Packages.
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            ["^@?\\w.*\\u0000$", "^@?\\w"],
            // Absolute imports and other imports.
            // Anything not matched in another group.
            ["(?<=\\u0000)$", "^"],
            // Relative imports.
            // Anything that starts with a dot.
            ["^\\..*\\u0000$", "^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },

  // Console ESLint configuration.
  {
    rules: {
      "no-console": "error",
    },
  },

  // Ignore linting the "dist" directory.
  {
    ignores: ["dist"],
  },
];