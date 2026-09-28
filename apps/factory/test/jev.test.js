import { describe, expect, it } from "vitest";

import {
  decideGate,
  decideReviews,
  decideTriage,
  reviewsByPath,
} from "../src/jev.js";

const yes = { noul: 0.9, type: "noul" };
const no = { noul: 0.1, type: "noul" };
const unsure = { noul: 0.5, type: "noul" };

const clearBug = {
  expectedActual: yes,
  kind: { choice: "bug", confidence: 0.95 },
  locatable: yes,
  reproducible: yes,
  safetyDomain: no,
  severity: { score: 1.4 },
  smallFix: yes,
};

describe(decideTriage, () => {
  it("routes a clear, small bug to the fix pipeline", () => {
    expect(decideTriage(clearBug).route).toBe("eligible");
  });

  it("asks for information and names every missing piece", () => {
    const vague = { ...clearBug, expectedActual: no, reproducible: unsure };
    expect(decideTriage(vague)).toStrictEqual({
      reasons: [
        "Missing expected vs actual behaviour",
        "Missing reproduction steps",
      ],
      route: "needs_info",
    });
  });

  it("sends safety-domain tickets to a person even when they are clear", () => {
    expect(decideTriage({ ...clearBug, safetyDomain: yes }).route).toBe(
      "human_only"
    );
  });

  it("sends feature requests to a person", () => {
    const feature = {
      ...clearBug,
      kind: { choice: "feature", confidence: 0.9 },
    };
    expect(decideTriage(feature)).toMatchObject({ route: "human_only" });
  });

  it("asks for information when Jev is unsure what kind of ticket it is", () => {
    const blurry = { ...clearBug, kind: { choice: "bug", confidence: 0.4 } };
    expect(decideTriage(blurry).route).toBe("needs_info");
  });
});

describe(reviewsByPath, () => {
  it("treats server functions as backend, not frontend", () => {
    expect(reviewsByPath(["apps/web/src/server/factory.ts"])).toStrictEqual({
      backend: true,
      frontend: false,
    });
  });

  it("treats components and lib as frontend", () => {
    expect(reviewsByPath(["apps/web/src/lib/search.ts"])).toStrictEqual({
      backend: false,
      frontend: true,
    });
  });
});

describe(decideReviews, () => {
  const files = ["apps/web/src/components/create-issue-dialog.tsx"];

  it("follows Jev when it is confident", () => {
    expect(decideReviews({ backend: yes, frontend: no }, files)).toStrictEqual({
      backend: { needed: true, source: "jev" },
      frontend: { needed: false, source: "jev" },
    });
  });

  it("falls back to changed paths when Jev is unsure", () => {
    expect(
      decideReviews({ backend: unsure, frontend: unsure }, files)
    ).toStrictEqual({
      backend: { needed: false, source: "paths" },
      frontend: { needed: true, source: "paths" },
    });
  });

  it("always runs at least one review", () => {
    expect(
      decideReviews({ backend: no, frontend: no }, []).frontend
    ).toStrictEqual({
      needed: true,
      source: "default",
    });
  });
});

describe(decideGate, () => {
  const calm = {
    requiresHuman: no,
    reviewersSatisfied: yes,
    risk: { score: 0.4 },
    safetyDomain: no,
  };
  const evidence = {
    changedFiles: ["apps/web/src/components/create-issue-dialog.tsx"],
    diffLines: 40,
    fix: { checks: { lint: "pass", test: "pass", typecheck: "pass" } },
    reviews: [
      { kind: "frontend", result: { unresolved: [], verdict: "changes_made" } },
    ],
  };

  it("clears a small, tested, reviewed change for automated merge", () => {
    expect(decideGate(calm, evidence)).toStrictEqual({
      humanReview: false,
      reasons: [],
    });
  });

  it("requires a person when Jev flags risk, even if the rules pass", () => {
    const { humanReview, reasons } = decideGate(
      { ...calm, risk: { score: 2.3 } },
      evidence
    );
    expect(humanReview).toBeTruthy();
    expect(reasons).toStrictEqual(["Jev rated merge risk 2.3 of 3"]);
  });

  it("requires a person when the diff touches guardrail files, even if Jev is calm", () => {
    const touched = {
      ...evidence,
      changedFiles: ["policy.json", ...evidence.changedFiles],
    };
    expect(decideGate(calm, touched).reasons).toStrictEqual([
      "Touches protected paths: policy.json",
    ]);
  });

  it("collects every rule that fails", () => {
    const messy = {
      ...evidence,
      diffLines: 420,
      fix: { checks: { lint: "pass", test: "fail", typecheck: "not_run" } },
      reviews: [
        {
          kind: "frontend",
          result: { unresolved: ["copy needs PM"], verdict: "changes_made" },
        },
      ],
    };
    expect(decideGate(calm, messy).reasons).toStrictEqual([
      "Checks not passing: test, typecheck",
      "Open review concerns from: frontend",
      "Diff is 420 lines, over the 300 line limit",
    ]);
  });
});
