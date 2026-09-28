import { z } from "zod";

import { formatZodError } from "@/lib/zod";
import {
  DAILY_TIMES,
  MODEL_IDS,
  REPOSITORY_IDS,
  WEEKDAY_IDS,
} from "@/modules/automation/constants";
import { isCronExpression } from "@/modules/automation/helpers";
import type { AutomationDraft } from "@/modules/automation/types";

const hourlyScheduleSchema = z.object({
  kind: z.literal("hourly"),
  minute: z.union([z.literal(0), z.literal(15), z.literal(30), z.literal(45)]),
});

const dailyScheduleSchema = z.object({
  kind: z.literal("daily"),
  time: z.enum(DAILY_TIMES),
});

const weeklyScheduleSchema = z.object({
  kind: z.literal("weekly"),
  day: z.enum(WEEKDAY_IDS),
  time: z.enum(DAILY_TIMES),
});

const customScheduleSchema = z.object({
  kind: z.literal("custom"),
  expression: z
    .string()
    .trim()
    .refine(isCronExpression, "Enter a valid 5-field cron expression"),
});

const scheduleSchema = z.discriminatedUnion("kind", [
  hourlyScheduleSchema,
  dailyScheduleSchema,
  weeklyScheduleSchema,
  customScheduleSchema,
]);

const scheduleTriggerSchema = z.object({
  id: z.string().min(1),
  type: z.literal("schedule"),
  schedule: scheduleSchema,
});

const eventTriggerSchema = z.object({
  id: z.string().min(1),
  type: z.literal("event"),
  source: z.enum([
    "github",
    "slack",
    "teams",
    "sentry",
    "linear",
    "webhook",
    "pagerduty",
  ]),
});

const toolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["memories", "tool", "mcp"]),
});

export const automationDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  active: z.boolean(),
  repositoryId: z.enum(REPOSITORY_IDS).nullable(),
  instructions: z.string().max(20_000),
  modelId: z.enum(MODEL_IDS),
  triggers: z.array(
    z.discriminatedUnion("type", [scheduleTriggerSchema, eventTriggerSchema])
  ),
  tools: z.array(toolSchema),
});

export type ParsedAutomationDraft = z.infer<typeof automationDraftSchema>;

export function parseAutomationDraft(
  draft: AutomationDraft
): { ok: true; draft: ParsedAutomationDraft } | { ok: false; error: string } {
  const result = automationDraftSchema.safeParse(draft);
  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }
  return { ok: true, draft: result.data };
}
