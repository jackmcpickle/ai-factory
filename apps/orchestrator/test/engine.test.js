import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { dispatch } from "../../../packages/contracts/src.js";
import { orchestrate, safetyGate } from "../src/engine.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const readJson = (file) =>
  JSON.parse(readFileSync(path.resolve(repoRoot, file), "utf-8"));

const signals = readJson("fixtures/signals.json");
const policy = readJson("policy.json");
const workspace = readJson("fixtures/workspace.json");
const run = (items, rule) => orchestrate(items, rule, workspace);

describe(orchestrate, () => {
  it("produces a deterministic multi-team trace", () => {
    const a = run(signals, policy);
    const b = run(signals, policy);
    expect(a).toStrictEqual(b);
    expect(Object.keys(a.teams).toSorted()).toStrictEqual([
      "app",
      "platform",
      "safety",
    ]);
    expect(a.events.every((event, i) => event.sequence === i + 1)).toBeTruthy();
  });

  it("keeps the release behind a human gate", () => {
    const { summary, outcomes } = run(signals, policy);
    expect(summary).toMatchObject({
      humanOnly: 2,
      needsInfo: 1,
      releaseApproved: false,
      reviewReady: 2,
    });
    expect(
      outcomes.every((o) => !o.customerCommitment && !o.releaseApproved)
    ).toBeTruthy();
  });

  it("makes app work human-only when the policy changes live", () => {
    const altered = {
      ...policy,
      humanOnlyTags: [...policy.humanOnlyTags, "ui"],
      version: "demo-v2",
    };
    const changedRun = run(signals, altered);
    expect(changedRun.outcomes.find((o) => o.id === "SIG-001").status).toBe(
      "human_only"
    );
    expect(changedRun.summary.reviewReady).toBe(1);
  });

  it("rejects non-synthetic input", () => {
    expect(() => run([{ ...signals[0], synthetic: false }], policy)).toThrow(
      /non-synthetic/u
    );
  });

  it("does not turn failed checks into release approval", () => {
    const changed = {
      ...signals[0],
      checks: { contract: true, negative: false, repro: true },
    };
    expect(run([changed], policy).outcomes[0].status).toBe("quality_failed");
  });

  it("fails closed on invalid project assignments", () => {
    const invalid = structuredClone(workspace);
    invalid.projects[0].assignedTeams = ["missing-team"];
    expect(() => orchestrate(signals, policy, invalid)).toThrow(
      /Unknown project assignment/u
    );
  });
});

describe(safetyGate, () => {
  const authority = {
    beforeCutoff: true,
    bookingActive: true,
    catalogueVersion: "v1",
    dietaryAttributes: ["none"],
    flightId: "SYNTH-001",
    idempotencyKey: "fake-1",
    inventoryAvailable: true,
    mealId: "M1",
    passengerToken: "synthetic-token",
  };
  const candidate = {
    dietaryAttributes: ["none"],
    flightId: "SYNTH-001",
    mealId: "M1",
  };

  it("allows matching evidence through to human review only", () => {
    const result = safetyGate(candidate, authority, policy);
    expect(result.decision).toBe("ELIGIBLE_FOR_HUMAN_REVIEW");
    expect(result.commitmentExecuted).toBeFalsy();
  });

  it.each([
    ["a dietary mismatch", { dietaryAttributes: ["nut-free"] }],
    ["a replayed idempotency key", { duplicateIdempotencyKey: true }],
    ["missing inventory", { inventoryAvailable: false }],
    ["a missing idempotency key", { idempotencyKey: null }],
  ])("fails closed on %s", (_label, override) => {
    expect(
      safetyGate(candidate, { ...authority, ...override }, policy).decision
    ).toBe("HUMAN_ONLY");
  });
});

describe("project isolation", () => {
  it("dispatches loops per project while teams live outside them", () => {
    const schedule = run(signals, policy);
    expect(schedule.tenancyBoundary).toBe("project");
    expect(schedule.projectId).toBe("meal-choice-demo");
    expect(schedule.loopDispatches.map((item) => item.loopId)).toStrictEqual([
      "daily-discovery",
    ]);

    const webhook = orchestrate(signals, policy, workspace, {
      eventType: "synthetic.feedback.received",
      type: "webhook",
    });
    expect(webhook.loopDispatches.map((item) => item.loopId)).toStrictEqual([
      "feedback-intake",
    ]);
  });

  it("keeps another project's loops side-effect free and team-scoped", () => {
    const other = dispatch({
      projectId: "separate-sandbox",
      signalIds: [],
      trigger: { eventType: "synthetic.feedback.received", type: "webhook" },
      workspace,
    });
    expect(other.map((item) => item.loopId)).toStrictEqual(["other-intake"]);
    expect(
      other.every(
        (item) => item.projectId === "separate-sandbox" && !item.sideEffects
      )
    ).toBeTruthy();
    expect(() =>
      orchestrate(
        signals,
        policy,
        workspace,
        { expression: "daily-review", type: "schedule" },
        "separate-sandbox"
      )
    ).toThrow(/Team not assigned/u);
  });
});
