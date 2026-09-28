import type { IntegrationKind } from "@/modules/integrations/types";

export const INTEGRATION_CATALOG = [
  {
    kind: "slack",
    name: "Slack",
    fieldLabel: "Slack channel",
    placeholder: "#releases",
  },
  {
    kind: "webhook",
    name: "Webhooks",
    fieldLabel: "Webhook URL",
    placeholder: "https://example.com/hooks/automation",
  },
  {
    kind: "jira",
    name: "Jira",
    fieldLabel: "Jira project",
    placeholder: "QANTAS",
  },
  {
    kind: "email",
    name: "Email",
    fieldLabel: "Email address",
    placeholder: "ops@example.com",
  },
  {
    kind: "github",
    name: "GitHub",
    fieldLabel: "GitHub repository",
    placeholder: "jackmcpickle/Qantas-AI",
  },
  {
    kind: "teams",
    name: "Microsoft Teams",
    fieldLabel: "Teams channel",
    placeholder: "Engineering",
  },
  {
    kind: "pagerduty",
    name: "PagerDuty",
    fieldLabel: "PagerDuty routing key",
    placeholder: "routing-key",
  },
] as const satisfies readonly {
  kind: IntegrationKind;
  name: string;
  fieldLabel: string;
  placeholder: string;
}[];

export const INTEGRATION_KINDS = [
  "slack",
  "webhook",
  "jira",
  "email",
  "github",
  "teams",
  "pagerduty",
] as const satisfies readonly IntegrationKind[];
