import { z } from "zod";

import {
  AGENT_HREFS,
  AGENT_IDS,
  DELIVERY_METRIC_IDS,
} from "@/modules/dashboard/types";

const agentHrefSchema = z.enum([
  AGENT_HREFS.automations,
  AGENT_HREFS.skills,
  AGENT_HREFS.validator,
  AGENT_HREFS.rules,
]);

export const agentUsageSchema = z.object({
  id: z.enum(AGENT_IDS),
  label: z.string().trim().min(1),
  href: agentHrefSchema,
  tokens: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative().finite(),
  timeMinutes: z.number().int().nonnegative(),
});

export const deliveryMetricSchema = z.object({
  id: z.enum(DELIVERY_METRIC_IDS),
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  detail: z.string().trim().min(1),
});

export const dashboardSnapshotSchema = z
  .object({
    periodLabel: z.string().trim().min(1),
    metrics: z.array(deliveryMetricSchema).length(DELIVERY_METRIC_IDS.length),
    agents: z.array(agentUsageSchema).length(AGENT_IDS.length),
  })
  .superRefine((snapshot, ctx) => {
    const metricIds = snapshot.metrics.map((metric) => metric.id);
    if (metricIds.join("|") !== DELIVERY_METRIC_IDS.join("|")) {
      ctx.addIssue({
        code: "custom",
        message: "Delivery metrics must stay in the dashboard order",
      });
    }
    const agentIds = snapshot.agents.map((agent) => agent.id);
    if (agentIds.join("|") !== AGENT_IDS.join("|")) {
      ctx.addIssue({
        code: "custom",
        message:
          "Agents must be automations, skill library, validator, and rules",
      });
    }
    snapshot.agents.forEach((agent, index) => {
      if (agent.href !== AGENT_HREFS[agent.id]) {
        ctx.addIssue({
          code: "custom",
          message: "Agent link does not match that section",
          path: ["agents", index, "href"],
        });
      }
    });
  });
