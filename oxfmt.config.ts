import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...ultracite.ignorePatterns,
    // Generated, vendored, or hashed: formatting would break checksums or be overwritten.
    "apps/web/src/routeTree.gen.ts",
    ".agents/skills/**",
    "outputs/**",
    "skills-lock.json",
    "*.vtt",
  ],
});
