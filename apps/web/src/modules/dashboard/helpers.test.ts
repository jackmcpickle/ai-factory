import { describe, expect, it } from "vitest";

import { FEATURE_PATH, isAutomationTabPath } from "@/lib/features";
import {
  SAMPLE_AGENTS,
  SAMPLE_MERGED_PULL_REQUESTS,
} from "@/modules/dashboard/constants";
import {
  buildDashboardSnapshot,
  findAgentUsage,
  formatDuration,
  formatTokenCount,
  formatUsd,
  sectionHasTokenMetrics,
  tokenCostPerPullRequest,
  totalAgentCostUsd,
} from "@/modules/dashboard/helpers";
import { dashboardSnapshotSchema } from "@/modules/dashboard/schemas/dashboard.schema";
import {
  AGENT_HREFS,
  AGENT_ID,
  AGENT_IDS,
  DELIVERY_METRIC_ID,
  DELIVERY_METRIC_IDS,
  SECTION_ID,
} from "@/modules/dashboard/types";

describe("token and cost formatting", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1k"],
    [1500, "1.5k"],
    [315_000, "315k"],
    [999_499, "999.5k"],
    [999_500, "1M"],
    [1_000_000, "1M"],
    [1_260_000, "1.26M"],
  ])("formats %i tokens as %s", (tokens, expected) => {
    expect(formatTokenCount(tokens)).toBe(expected);
  });

  it.each([-1, 1.5])("rejects a token count of %d", (tokens) => {
    expect(() => formatTokenCount(tokens)).toThrow(
      "Token count must be a non-negative integer"
    );
  });

  it.each([
    [0, "0m"],
    [22, "22m"],
    [59, "59m"],
    [60, "1h"],
    [61, "1h 1m"],
    [384, "6h 24m"],
    [1080, "18h"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it("rejects a negative duration", () => {
    expect(() => formatDuration(-1)).toThrow(
      "Duration must be a non-negative integer"
    );
  });

  it.each([
    [0, "$0.00"],
    [1.42, "$1.42"],
    [8.4, "$8.40"],
    [19.88, "$19.88"],
  ])("formats %d dollars as %s", (usd, expected) => {
    expect(formatUsd(usd)).toBe(expected);
  });

  it.each([-0.01, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects a cost of %d",
    (usd) => {
      expect(() => formatUsd(usd)).toThrow(
        "Cost must be a non-negative finite number"
      );
    }
  );
});

describe("agent links", () => {
  it.each([
    ["automations", FEATURE_PATH.automation],
    ["skills", FEATURE_PATH.skills],
    ["validator", FEATURE_PATH.validator],
    ["rules", FEATURE_PATH.rules],
  ] as const)("opens %s at %s", (id, path) => {
    expect(AGENT_HREFS[id]).toBe(path);
    expect(isAutomationTabPath(path)).toBeFalsy();
  });
});

describe("agent token metrics", () => {
  it.each([
    SECTION_ID.automations,
    SECTION_ID.skills,
    SECTION_ID.validator,
    SECTION_ID.rules,
  ])("shows token metrics on the %s section", (section) => {
    expect(sectionHasTokenMetrics(section)).toBeTruthy();
  });

  it.each([SECTION_ID.integrations, ""])(
    "keeps token metrics off the %j section",
    (section) => {
      expect(sectionHasTokenMetrics(section)).toBeFalsy();
    }
  );

  it("derives token cost per pull request from agent spend", () => {
    expect(totalAgentCostUsd(SAMPLE_AGENTS)).toBe(19.88);
    expect(
      tokenCostPerPullRequest(SAMPLE_AGENTS, SAMPLE_MERGED_PULL_REQUESTS)
    ).toBe(1.42);
  });

  it.each([0, 1.5])("rejects %d merged pull requests", (count) => {
    expect(() => tokenCostPerPullRequest(SAMPLE_AGENTS, count)).toThrow(
      "Merged pull requests must be a positive integer"
    );
  });

  it("totals an empty agent list as zero cost", () => {
    expect(totalAgentCostUsd([])).toBe(0);
  });

  it("rejects a negative agent cost", () => {
    const agents = [{ ...SAMPLE_AGENTS[0], costUsd: -1 }];
    expect(() => totalAgentCostUsd(agents)).toThrow(
      "Agent cost must be a non-negative finite number"
    );
  });
});

describe("dashboard snapshot", () => {
  const snapshot = dashboardSnapshotSchema.parse(buildDashboardSnapshot());

  it("publishes the delivery set and the four agent sections", () => {
    expect(snapshot.metrics.map((metric) => metric.id)).toStrictEqual([
      ...DELIVERY_METRIC_IDS,
    ]);
    expect(snapshot.agents.map((agent) => agent.id)).toStrictEqual([
      ...AGENT_IDS,
    ]);
    expect(snapshot.periodLabel).toBe("Last 7 days");
    expect(findAgentUsage(snapshot.agents, AGENT_ID.validator)?.tokens).toBe(
      945_000
    );
  });

  it.each([
    [DELIVERY_METRIC_ID.tokenCostPerPr, "$1.42"],
    [DELIVERY_METRIC_ID.timeToMerge, "6h 24m"],
    [DELIVERY_METRIC_ID.deployments, "11"],
    [DELIVERY_METRIC_ID.agentReviewTime, "22m"],
    [DELIVERY_METRIC_ID.leadTime, "18h"],
  ])("reports %s as %s", (id, expected) => {
    const metric = snapshot.metrics.find((item) => item.id === id);
    expect(metric?.value).toBe(expected);
  });

  it("rejects an integrations row among agents", () => {
    const forged = {
      ...snapshot,
      agents: snapshot.agents.map((agent, index) =>
        index === snapshot.agents.length - 1
          ? { ...agent, id: SECTION_ID.integrations }
          : agent
      ),
    };
    expect(dashboardSnapshotSchema.safeParse(forged).success).toBeFalsy();
  });
});
