import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const HOOK = path.join(import.meta.dirname, "secureRead.ts");

function runHook(input: unknown) {
  const stdin = typeof input === "string" ? input : JSON.stringify(input);
  return spawnSync(process.execPath, [HOOK], {
    encoding: "utf-8",
    input: stdin,
  });
}

const read = (filePath: string) => ({
  tool_input: { file_path: filePath },
  tool_name: "Read",
});
const bash = (command: string) => ({
  tool_input: { command },
  tool_name: "Bash",
});

describe("secureRead hook", () => {
  it.each([
    ["an env file", read("/repo/.env")],
    ["a nested env variant", read("/repo/apps/web/.env.local")],
    ["cat on an env file", bash("cat .env")],
    ["piped env reads", bash("cat apps/web/.env.production | head")],
    ["path traversal", read("/repo/../etc/passwd")],
    ["ssh keys", read("/home/u/.ssh/id_ed25519")],
    ["certificates", read("/repo/certs/server.pem")],
    ["registry tokens", read("/repo/.npmrc")],
    [
      "the git directory",
      {
        tool_input: { path: "/repo/.git/", pattern: "**/*" },
        tool_name: "Glob",
      },
    ],
  ])("blocks %s", (_label, input) => {
    const result = runHook(input);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/^Blocked:/u);
  });

  it.each([
    ["the env example", read("/repo/.env.example")],
    ["workflow files", read("/repo/.github/workflows/ci.yml")],
    ["files that merely contain 'env'", read("/repo/src/environment.ts")],
    ["process.env in shell commands", bash("grep -rn process.env src")],
    ["relative cd in shell commands", bash("cd .. && ls")],
    ["property access in one-liners", bash("node -e 'console.log(obj.key)'")],
  ])("allows %s", (_label, input) => {
    expect(runHook(input).status).toBe(0);
  });

  it("fails closed on malformed input", () => {
    expect(runHook("not json").status).toBe(2);
  });
});
