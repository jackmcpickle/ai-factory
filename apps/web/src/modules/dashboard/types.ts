import { FEATURE_PATH } from "@/lib/features";

export const AGENT_IDS = [
  "automations",
  "skills",
  "validator",
  "rules",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export const AGENT_ID = {
  automations: "automations",
  skills: "skills",
  validator: "validator",
  rules: "rules",
} as const satisfies Record<AgentId, AgentId>;

export const AGENT_HREFS = {
  automations: FEATURE_PATH.automation,
  skills: FEATURE_PATH.skills,
  validator: FEATURE_PATH.validator,
  rules: FEATURE_PATH.rules,
} as const satisfies Record<AgentId, string>;

export type AgentHref = (typeof AGENT_HREFS)[AgentId];

export const DELIVERY_METRIC_IDS = [
  "time-to-merge",
  "deployments",
  "token-cost-per-pr",
  "agent-review-time",
  "pull-requests-merged",
  "lead-time",
] as const;

export type DeliveryMetricId = (typeof DELIVERY_METRIC_IDS)[number];

export const DELIVERY_METRIC_ID = {
  timeToMerge: "time-to-merge",
  deployments: "deployments",
  tokenCostPerPr: "token-cost-per-pr",
  agentReviewTime: "agent-review-time",
  pullRequestsMerged: "pull-requests-merged",
  leadTime: "lead-time",
} as const satisfies Record<string, DeliveryMetricId>;

export const SECTION_ID = {
  automations: "automations",
  skills: "skills",
  validator: "validator",
  rules: "rules",
  integrations: "integrations",
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

export interface AgentUsage {
  id: AgentId;
  label: string;
  href: AgentHref;
  tokens: number;
  costUsd: number;
  timeMinutes: number;
}

export interface DeliveryMetric {
  id: DeliveryMetricId;
  label: string;
  value: string;
  detail: string;
}

export interface DashboardSnapshot {
  periodLabel: string;
  metrics: DeliveryMetric[];
  agents: AgentUsage[];
}
