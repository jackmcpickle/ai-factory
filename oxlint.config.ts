import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, tanstack, vitest],
  ignorePatterns: [
    ...core.ignorePatterns,
    // Generated or vendored: regenerate instead of hand-fixing.
    "apps/web/src/routeTree.gen.ts",
    "apps/web/src/components/ui/**",
    ".agents/skills/**",
    "outputs/**",
  ],
  rules: {
    // House style is `function` declarations for components and helpers,
    // with helpers declared below the component that uses them.
    "func-style": "off",
    "react/function-component-definition": "off",
    "no-use-before-define": ["error", { functions: false, variables: true }],
    // Components and hooks are named after their export (SkillList.tsx, useRules.ts).
    "unicorn/filename-case": [
      "error",
      { cases: { camelCase: true, kebabCase: true, pascalCase: true } },
    ],
  },
  overrides: [
    {
      // Classic <script defer> files that share globals across the deck.
      files: ["apps/presentation/*.js"],
      rules: {
        "no-implicit-globals": "off",
        "no-unused-vars": "off",
      },
    },
  ],
});
