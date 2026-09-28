import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Shared by the root `web` and `integration` projects. The TanStack Start
// plugin is left out: tests render components directly, not through the SSR
// server, so only JSX and the `#/` / `@/` path aliases are needed.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
