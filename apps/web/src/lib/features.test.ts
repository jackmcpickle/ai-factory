import { describe, expect, it } from "vitest";

import { FEATURE_PATH, isAutomationTabPath } from "@/lib/features";

describe("feature routes", () => {
  it.each([
    ["dashboard", FEATURE_PATH.dashboard, "/"],
    ["automation", FEATURE_PATH.automation, "/automation"],
    ["skills", FEATURE_PATH.skills, "/skills"],
    ["validator", FEATURE_PATH.validator, "/validator"],
    ["rules", FEATURE_PATH.rules, "/rules"],
    ["integrations", FEATURE_PATH.integrations, "/integrations"],
  ] as const)("keeps %s at %s", (_name, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it.each([
    FEATURE_PATH.skills,
    FEATURE_PATH.validator,
    FEATURE_PATH.rules,
    FEATURE_PATH.integrations,
    FEATURE_PATH.automation,
  ])("keeps %s off an automation tab", (path) => {
    expect(isAutomationTabPath(path)).toBeFalsy();
  });

  it("treats a nested automation path as a tab", () => {
    expect(isAutomationTabPath("/automation/skills")).toBeTruthy();
  });
});
