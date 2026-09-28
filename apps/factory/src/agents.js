import path from "node:path";

import { claudeCode, createSandbox, run } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

import { MODELS } from "./models.js";
import { extractTagged, mergeSchema } from "./schemas.js";

const PROMPTS = path.resolve(import.meta.dirname, "../prompts");
export const IMAGE = "sandcastle:qantas-factory";

const INSTALL = {
  command: "pnpm install --frozen-lockfile",
  timeoutMs: 15 * 60_000,
};

/**
 * Sandcastle wrapper. Every Claude step for one ticket shares one sandbox and
 * one branch, so dependencies install once and each agent sees the last one's
 * commits. `local` skips Docker and runs on the host in a git worktree.
 */
export function createAgents({ repoRoot, runDir, base, local, onEvent }) {
  // The key goes on the sandbox provider, not claudeCode(): createSandbox()
  // only forwards provider env into the container, never agent env.
  const env = claudeAuth(process.env);
  const agent = (model) =>
    claudeCode(model, {
      effort: "high",
      ...(local && { permissionMode: "auto" }),
    });
  const provider = () =>
    local ? noSandbox({ env }) : docker({ env, imageName: IMAGE });
  const logging = (name) => ({
    onAgentStreamEvent: (event) => onEvent(name, event),
    path: path.join(runDir, `${name}.log`),
    type: "file",
  });

  return {
    async merge({ args, branch }) {
      // Runs on the host: it needs the developer's gh and git credentials.
      const result = await run({
        agent: claudeCode(MODELS.engineer, {
          effort: "high",
          permissionMode: "auto",
        }),
        branchStrategy: { branch, type: "branch" },
        cwd: repoRoot,
        hooks: { sandbox: { onSandboxReady: [INSTALL] } },
        idleTimeoutSeconds: 30 * 60,
        logging: logging("merge"),
        name: "merge",
        promptArgs: args,
        promptFile: path.join(PROMPTS, "merge.md"),
        sandbox: noSandbox({ env }),
      });
      return extractTagged(result.stdout, "merge", mergeSchema);
    },

    openSandbox(branch) {
      return createSandbox({
        baseBranch: base,
        branch,
        cwd: repoRoot,
        hooks: { sandbox: { onSandboxReady: [INSTALL] } },
        sandbox: provider(),
      });
    },

    async step(sandbox, { args, model, name, prompt, schema, tag }) {
      const result = await sandbox.run({
        agent: agent(model),
        logging: logging(name),
        name,
        promptArgs: args,
        promptFile: path.join(PROMPTS, prompt),
      });
      return {
        commits: result.commits,
        output: extractTagged(result.stdout, tag, schema),
        usage: result.iterations.map((iteration) => iteration.usage ?? null),
      };
    },
  };
}

/**
 * A subscription token (`claude setup-token`) wins over an API key, because
 * Claude Code prefers ANTHROPIC_API_KEY whenever both are present.
 */
export function claudeAuth({ ANTHROPIC_API_KEY, CLAUDE_CODE_OAUTH_TOKEN }) {
  if (CLAUDE_CODE_OAUTH_TOKEN) {
    return { CLAUDE_CODE_OAUTH_TOKEN };
  }
  return ANTHROPIC_API_KEY ? { ANTHROPIC_API_KEY } : {};
}
