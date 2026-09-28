import { defineConfig } from "vitest/config";

const INTEGRATION = "src/**/*.integration.test.{ts,tsx}";

export default defineConfig({
  test: {
    coverage: {
      include: [
        "apps/orchestrator/src/**",
        "apps/factory/src/**",
        "packages/contracts/**",
        "apps/web/src/**",
      ],
      exclude: ["apps/web/src/components/ui/**", "**/routeTree.gen.ts"],
      provider: "v8",
    },
    projects: [
      {
        test: {
          environment: "node",
          include: [
            "apps/orchestrator/**/*.test.js",
            "apps/factory/**/*.test.js",
            "packages/*/**/*.test.js",
            ".agents/hooks/**/*.test.ts",
          ],
          name: "unit",
        },
      },
      {
        extends: "./apps/web/vitest.config.ts",
        root: "./apps/web",
        test: {
          exclude: [INTEGRATION, "**/node_modules/**"],
          include: ["src/**/*.test.{ts,tsx}"],
          name: "web",
        },
      },
      {
        extends: "./apps/web/vitest.config.ts",
        root: "./apps/web",
        test: { include: [INTEGRATION], name: "integration" },
      },
    ],
  },
});
