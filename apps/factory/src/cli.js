import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { TypeSafeClient } from "@typesafe-ai/sdk";

import { claudeAuth, createAgents, IMAGE } from "./agents.js";
import { createGit } from "./git.js";
import { runFactory } from "./pipeline.js";
import { ticketSchema } from "./schemas.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const USAGE = `Usage: pnpm factory --ticket <file> [--base main] [--local] [--no-pr]

  --ticket  Synthetic ticket JSON, e.g. fixtures/tickets/QF-101-clear.json
  --base    Branch to fork from and open the PR against (default: main)
  --local   Run agents on the host in a git worktree instead of Docker
  --no-pr   Stop after the merge gate with a local branch; no push, PR or merge`;

const { values } = parseArgs({
  options: {
    base: { default: "main", type: "string" },
    help: { type: "boolean" },
    local: { type: "boolean" },
    "no-pr": { type: "boolean" },
    ticket: { type: "string" },
  },
});

if (values.help || !values.ticket) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 1);
}

try {
  preflight(values.local);
  const ticket = ticketSchema.parse(
    JSON.parse(await readFile(path.resolve(values.ticket), "utf-8"))
  );
  const runId = `${ticket.id}-${new Date().toISOString().replaceAll(/[:.]/gu, "-")}`;
  const runDir = path.join(repoRoot, ".sandcastle", "runs", runId);
  await mkdir(runDir, { recursive: true });

  const result = await runFactory({
    agents: createAgents({
      base: values.base,
      local: values.local,
      onEvent: printToolCall,
      repoRoot,
      runDir,
    }),
    base: values.base,
    branch: `agent/${runId.toLowerCase()}`,
    git: createGit(repoRoot),
    jev: new TypeSafeClient(),
    log: (step, message) => console.log(`\n▸ ${step}: ${message}`),
    openPr: !values["no-pr"],
    record: (name, data) =>
      writeFile(
        path.join(runDir, `${name}.json`),
        `${JSON.stringify(data, null, 2)}\n`
      ),
    ticket,
  });
  await writeFile(
    path.join(runDir, "result.json"),
    `${JSON.stringify(result, null, 2)}\n`
  );

  console.log(`\n${ticket.id}: ${result.status}`);
  for (const reason of result.reasons) {
    console.log(`  - ${reason}`);
  }
  if (result.prUrl) {
    console.log(`PR: ${result.prUrl}`);
  } else if (result.branch) {
    console.log(`Branch: ${result.branch}`);
  }
  console.log(`Artifacts: ${path.relative(repoRoot, runDir)}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function preflight(local) {
  const missing = [
    !process.env.TYPESAFE_API_KEY && "TYPESAFE_API_KEY",
    Object.keys(claudeAuth(process.env)).length === 0 &&
      "ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(" and ")}. Add them to .env (see .env.example).`
    );
  }
  if (!local) {
    try {
      execFileSync("docker", ["image", "inspect", IMAGE], { stdio: "ignore" });
    } catch {
      throw new Error(
        `Docker image ${IMAGE} not found. Build it with \`pnpm factory:image\` or pass --local.`
      );
    }
  }
}

function printToolCall(step, event) {
  if (event.type === "toolCall") {
    console.log(
      `  [${step}] ${event.name} ${event.formattedArgs.slice(0, 100)}`
    );
  }
}
