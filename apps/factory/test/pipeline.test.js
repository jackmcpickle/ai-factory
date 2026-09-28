import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { runFactory } from "../src/pipeline.js";

const ticket = JSON.parse(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "../../../fixtures/tickets/QF-101-clear.json"
    ),
    "utf-8"
  )
);

const yes = { noul: 0.9, type: "noul" };
const no = { noul: 0.1, type: "noul" };

const answers = {
  gate: {
    requiresHuman: no,
    reviewersSatisfied: yes,
    risk: { score: 0.3 },
    safetyDomain: no,
  },
  route: { backend: no, frontend: yes },
  triage: {
    expectedActual: yes,
    kind: { choice: "bug", confidence: 0.95 },
    locatable: yes,
    reproducible: yes,
    safetyDomain: no,
    severity: { score: 1.5 },
    smallFix: yes,
  },
};

const outputs = {
  fix: {
    checks: { lint: "pass", test: "pass", typecheck: "pass" },
    filesChanged: ["apps/web/src/components/create-issue-dialog.tsx"],
    summary: "Reset team, status and priority when the dialog closes",
    testsAdded: ["apps/web/src/components/create-issue-dialog.test.tsx"],
  },
  handoff: {
    confidence: "high",
    discovery: [],
    files: [
      {
        path: "apps/web/src/components/create-issue-dialog.tsx",
        reason: "close()",
      },
    ],
    proposedFix: "Reset all fields in close()",
    reproduction: ["Open dialog", "Change priority", "Esc", "Reopen"],
    rootCause: "close() only resets title and description",
    surfaces: ["frontend"],
    testPlan: ["Reopen shows defaults"],
  },
  review: { findings: [], unresolved: [], verdict: "approved" },
};

function jevStep(questions) {
  if ("kind" in questions) {
    return "triage";
  }
  return "backend" in questions ? "route" : "gate";
}

function fakeJev(overrides = {}) {
  return {
    systemOne: vi.fn(({ questions }) => {
      const step = jevStep(questions);
      return Promise.resolve({
        answers: { ...answers[step], ...overrides[step] },
        model: "jev-test",
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }),
  };
}

function setup({
  jev = fakeJev(),
  fixCommits = [{ sha: "abc" }],
  openPr = true,
} = {}) {
  const sandbox = { close: vi.fn(() => Promise.resolve({})) };
  const agents = {
    merge: vi.fn(() =>
      Promise.resolve({ reason: "CI green", status: "merged" })
    ),
    openSandbox: vi.fn(() => Promise.resolve(sandbox)),
    step: vi.fn((_sandbox, { tag }) =>
      Promise.resolve({
        commits: tag === "fix" ? fixCommits : [],
        output: outputs[tag],
        usage: [],
      })
    ),
  };
  const git = {
    changes: vi.fn(() =>
      Promise.resolve({
        changedFiles: outputs.fix.filesChanged,
        diff: "diff --git ...",
        diffLines: 24,
        diffStat: "1 file changed",
      })
    ),
    openPr: vi.fn(() => Promise.resolve("https://github.com/example/pr/1")),
  };
  const recorded = {};
  const run = () =>
    runFactory({
      agents,
      base: "main",
      branch: "agent/qf-101",
      git,
      jev,
      log: () => {},
      openPr,
      record: (name, data) => {
        recorded[name] = data;
      },
      ticket,
    });
  return { agents, git, recorded, run, sandbox };
}

describe(runFactory, () => {
  it("takes a clear ticket through fix, frontend review, PR and merge", async () => {
    const { agents, run } = setup();

    await expect(run()).resolves.toMatchObject({
      prUrl: "https://github.com/example/pr/1",
      status: "merged",
    });
    const steps = agents.step.mock.calls.map(([, { name, model }]) => [
      name,
      model,
    ]);
    expect(steps).toStrictEqual([
      ["rca", "claude-sonnet-5-5"],
      ["fix", "claude-opus-5-5"],
      ["review-frontend", "claude-opus-5-5"],
    ]);
    expect(agents.step.mock.calls[1][1].args.HANDOFF).toContain(
      "close() only resets"
    );
  });

  it("records every step and closes the sandbox before opening the PR", async () => {
    const { git, recorded, run, sandbox } = setup();

    await run();
    expect(sandbox.close).toHaveBeenCalledBefore(git.openPr);
    expect(git.openPr).toHaveBeenCalledWith(
      expect.objectContaining({ humanReview: false })
    );
    expect(Object.keys(recorded)).toStrictEqual([
      "triage",
      "handoff",
      "fix",
      "route",
      "review-frontend",
      "gate",
      "pr",
      "merge",
    ]);
  });

  it("stops after triage when the ticket is unclear, without starting a sandbox", async () => {
    const jev = fakeJev({ triage: { expectedActual: no, reproducible: no } });
    const { agents, run } = setup({ jev });

    await expect(run()).resolves.toStrictEqual({
      reasons: [
        "Missing expected vs actual behaviour",
        "Missing reproduction steps",
      ],
      status: "needs_info",
    });
    expect(agents.openSandbox).not.toHaveBeenCalled();
  });

  it("runs both reviewers in order when Jev routes to both", async () => {
    const jev = fakeJev({ route: { backend: yes, frontend: yes } });
    const { agents, run } = setup({ jev });

    await run();
    const reviews = agents.step.mock.calls
      .map(([, { args, name }]) => [name, args.SKILL])
      .filter(([name]) => name.startsWith("review"));
    expect(reviews).toStrictEqual([
      ["review-backend", "elite-backend"],
      ["review-frontend", "elite-react"],
    ]);
  });

  it("opens a labelled PR and does not merge when the gate wants a person", async () => {
    const jev = fakeJev({ gate: { requiresHuman: yes } });
    const { agents, git, run } = setup({ jev });

    await expect(run()).resolves.toMatchObject({
      reasons: ["Jev flagged the change for a person"],
      status: "human_review",
    });
    expect(git.openPr).toHaveBeenCalledWith(
      expect.objectContaining({ humanReview: true })
    );
    expect(git.openPr.mock.calls[0][0].body).toContain(
      "Why a person must review"
    );
    expect(agents.merge).not.toHaveBeenCalled();
  });

  it("stops without a PR when the fix agent made no commits", async () => {
    const { git, run, sandbox } = setup({ fixCommits: [] });

    await expect(run()).resolves.toMatchObject({ status: "no_fix" });
    expect(sandbox.close).toHaveBeenCalledOnce();
    expect(git.openPr).not.toHaveBeenCalled();
  });

  it("leaves a local branch when PRs are turned off", async () => {
    const { agents, git, run } = setup({ openPr: false });

    await expect(run()).resolves.toMatchObject({
      branch: "agent/qf-101",
      status: "branch_ready",
    });
    expect(git.openPr).not.toHaveBeenCalled();
    expect(agents.merge).not.toHaveBeenCalled();
  });

  it("closes the sandbox when an agent step fails", async () => {
    const { agents, run, sandbox } = setup();
    agents.step.mockRejectedValueOnce(
      new Error("Agent output is missing a <handoff> block")
    );

    await expect(run()).rejects.toThrow("missing a <handoff> block");
    expect(sandbox.close).toHaveBeenCalledOnce();
  });
});
