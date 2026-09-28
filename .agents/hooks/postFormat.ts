/**
 * PostToolUse: format and lint-fix only the file the agent just wrote.
 *
 * Running `ultracite fix` over the whole repo after every edit is slow and
 * rewrites files other agents are working in, so this scopes it to one path.
 */
import { execFileSync } from "node:child_process";

interface HookInput {
  tool_input?: { file_path?: string; path?: string };
}

async function readInput(): Promise<HookInput> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString()) as HookInput;
  } catch {
    return {};
  }
}

const input = await readInput();
const filePath = input.tool_input?.file_path ?? input.tool_input?.path ?? "";

if (filePath && !filePath.includes("..")) {
  try {
    execFileSync("pnpm", ["exec", "ultracite", "fix", filePath], {
      stdio: "pipe",
      timeout: 15_000,
    });
  } catch {
    // Formatting is best-effort; lint errors surface in pre-commit and CI.
  }
}
