import { describe, expect, it } from "vitest";

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
  AGENT_ID,
  AGENT_IDS,
  DELIVERY_METRIC_ID,
  DELIVERY_METRIC_IDS,
  SECTION_ID,
} from "@/modules/dashboard/types";

describe("token and cost formatting", () => {
  it("formats token counts at the thousand and million boundaries", () => {
    expect(formatTokenCount(0)).toBe("0");
    expect(formatTokenCount(999)).toBe("999");
    expect(formatTokenCount(1000)).toBe("1k");
    expect(formatTokenCount(1500)).toBe("1.5k");
    expect(formatTokenCount(315_000)).toBe("315k");
    expect(formatTokenCount(999_499)).toBe("999.5k");
    expect(formatTokenCount(999_500)).toBe("1M");
    expect(formatTokenCount(1_000_000)).toBe("1M");
    expect(formatTokenCount(1_260_000)).toBe("1.26M");
  });

  it("rejects a negative or fractional token count", () => {
    expect(() => formatTokenCount(-1)).toThrow(
      "Token count must be a non-negative integer"
    );
    expect(() => formatTokenCount(1.5)).toThrow(
      "Token count must be a non-negative integer"
    );
  });

  it("formats durations from minutes through hours", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(22)).toBe("22m");
    expect(formatDuration(59)).toBe("59m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(61)).toBe("1h 1m");
    expect(formatDuration(384)).toBe("6h 24m");
    expect(formatDuration(1080)).toBe("18h");
  });

  it("rejects a negative duration", () => {
    expect(() => formatDuration(-1)).toThrow(
      "Duration must be a non-negative integer"
    );
  });

  it("formats dollar amounts in cents", () => {
    expect(formatUsd(0)).toBe("$0.00");
    expect(formatUsd(1.42)).toBe("$1.42");
    expect(formatUsd(8.4)).toBe("$8.40");
    expect(formatUsd(19.88)).toBe("$19.88");
  });

  it("rejects a negative or non-finite cost", () => {
    expect(() => formatUsd(-0.01)).toThrow(
      "Cost must be a non-negative finite number"
    );
    expect(() => formatUsd(Number.NaN)).toThrow(
      "Cost must be a non-negative finite number"
    );
    expect(() => formatUsd(Number.POSITIVE_INFINITY)).toThrow(
      "Cost must be a non-negative finite number"
    );
  });
});

describe("agent token metrics", () => {
  it("keeps token metrics on agent sections and off integrations", () => {
    expect(sectionHasTokenMetrics(SECTION_ID.integrations)).toBe(false);
    expect(sectionHasTokenMetrics(SECTION_ID.automations)).toBe(true);
    expect(sectionHasTokenMetrics(SECTION_ID.skills)).toBe(true);
    expect(sectionHasTokenMetrics(SECTION_ID.validator)).toBe(true);
    expect(sectionHasTokenMetrics(SECTION_ID.rules)).toBe(true);
    expect(sectionHasTokenMetrics("")).toBe(false);
  });

  it("derives token cost per pull request from agent spend", () => {
    expect(totalAgentCostUsd(SAMPLE_AGENTS)).toBe(19.88);
    expect(
      tokenCostPerPullRequest(SAMPLE_AGENTS, SAMPLE_MERGED_PULL_REQUESTS)
    ).toBe(1.42);
  });

  it("rejects a non-positive merged pull request count", () => {
    expect(() => tokenCostPerPullRequest(SAMPLE_AGENTS, 0)).toThrow(
      "Merged pull requests must be a positive integer"
    );
    expect(() => tokenCostPerPullRequest(SAMPLE_AGENTS, 1.5)).toThrow(
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
  it("publishes the delivery set and the four agent sections", () => {
    const snapshot = dashboardSnapshotSchema.parse(buildDashboardSnapshot());
    expect(snapshot.metrics.map((metric) => metric.id)).toEqual([
      ...DELIVERY_METRIC_IDS,
    ]);
    expect(snapshot.agents.map((agent) => agent.id)).toEqual([...AGENT_IDS]);
    expect(snapshot.periodLabel).toBe("Last 7 days");
    const cost = snapshot.metrics.find(
      (metric) => metric.id === DELIVERY_METRIC_ID.tokenCostPerPr
    );
    expect(cost?.value).toBe("$1.42");
    expect(
      snapshot.metrics.find(
        (metric) => metric.id === DELIVERY_METRIC_ID.timeToMerge
      )?.value
    ).toBe("6h 24m");
    expect(
      snapshot.metrics.find(
        (metric) => metric.id === DELIVERY_METRIC_ID.deployments
      )?.value
    ).toBe("11");
    expect(
      snapshot.metrics.find(
        (metric) => metric.id === DELIVERY_METRIC_ID.agentReviewTime
      )?.value
    ).toBe("22m");
    expect(
      snapshot.metrics.find(
        (metric) => metric.id === DELIVERY_METRIC_ID.leadTime
      )?.value
    ).toBe("18h");
    expect(findAgentUsage(snapshot.agents, AGENT_ID.validator)?.tokens).toBe(
      945_000
    );
  });

  it("rejects an integrations row among agents", () => {
    const snapshot = buildDashboardSnapshot();
    const forged = {
      ...snapshot,
      agents: snapshot.agents.map((agent, index) =>
        index === snapshot.agents.length - 1
          ? { ...agent, id: SECTION_ID.integrations }
          : agent
      ),
    };
    expect(dashboardSnapshotSchema.safeParse(forged).success).toBe(false);
  });
});
