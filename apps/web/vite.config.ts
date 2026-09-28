import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: { fs: { allow: [repoRoot] } },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
