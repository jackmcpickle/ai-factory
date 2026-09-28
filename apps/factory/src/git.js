import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const MAX_DIFF_CHARS = 20_000;
export const HUMAN_LABEL = "needs-human-review";

/** Host-side git and GitHub operations. The branch is shared with the sandbox worktree. */
export function createGit(repoRoot) {
  const sh = async (cmd, args, input) => {
    const child = exec(cmd, args, {
      cwd: repoRoot,
      maxBuffer: 32 * 1024 * 1024,
    });
    if (input !== undefined) {
      child.child.stdin.end(input);
    }
    const { stdout } = await child;
    return stdout.trim();
  };

  return {
    async changes(base, branch) {
      const range = `${base}...${branch}`;
      const [names, numstat, stat, patch] = await Promise.all([
        sh("git", ["diff", "--name-only", range]),
        sh("git", ["diff", "--numstat", range]),
        sh("git", ["diff", "--stat", range]),
        sh("git", ["diff", range]),
      ]);
      return {
        changedFiles: names ? names.split("\n") : [],
        diff:
          patch.length > MAX_DIFF_CHARS
            ? `${patch.slice(0, MAX_DIFF_CHARS)}\n[diff truncated]`
            : patch,
        diffLines: countLines(numstat),
        diffStat: stat,
      };
    },

    async openPr({ base, body, branch, humanReview, title }) {
      await sh("git", ["push", "--set-upstream", "origin", branch]);
      const labels = [];
      if (humanReview) {
        await sh("gh", [
          "label",
          "create",
          HUMAN_LABEL,
          "--color",
          "D93F0B",
          "--description",
          "Factory gate requires a person to review before merge",
          "--force",
        ]);
        labels.push("--label", HUMAN_LABEL);
      }
      return sh(
        "gh",
        [
          "pr",
          "create",
          "--base",
          base,
          "--head",
          branch,
          "--title",
          title,
          "--body-file",
          "-",
          ...labels,
        ],
        body
      );
    },
  };
}

export function countLines(numstat) {
  let total = 0;
  for (const line of numstat.split("\n").filter(Boolean)) {
    const [added, removed] = line.split("\t");
    // Binary files report "-" for both counts.
    total += (Number(added) || 0) + (Number(removed) || 0);
  }
  return total;
}
