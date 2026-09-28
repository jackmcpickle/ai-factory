export const INTEGRATION_KIND = {
  slack: "slack",
  webhook: "webhook",
  jira: "jira",
  email: "email",
  github: "github",
  teams: "teams",
  pagerduty: "pagerduty",
} as const;

export type IntegrationKind =
  (typeof INTEGRATION_KIND)[keyof typeof INTEGRATION_KIND];

export const CONNECTION_STATUS = {
  connected: "connected",
  disconnected: "disconnected",
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export interface IntegrationDraft {
  kind: IntegrationKind;
  value: string;
}

export interface IntegrationConnection {
  id: string;
  kind: IntegrationKind;
  name: string;
  fieldLabel: string;
  value: string;
  status: ConnectionStatus;
}

interface IntegrationsBase {
  nextId: number;
  connections: IntegrationConnection[];
}

export type IntegrationsModel =
  | (IntegrationsBase & { type: "Ready"; error: null })
  | (IntegrationsBase & { type: "Invalid"; error: string });

export type IntegrationsAction =
  | { type: "CONNECT"; draft: IntegrationDraft }
  | { type: "DISCONNECT"; id: string }
  | { type: "RECONNECT"; id: string }
  | { type: "REMOVE"; id: string };
