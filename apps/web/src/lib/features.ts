export const FEATURE_PATH = {
  dashboard: "/",
  automation: "/automation",
  skills: "/skills",
  validator: "/validator",
  rules: "/rules",
  integrations: "/integrations",
} as const;

export type FeaturePath = (typeof FEATURE_PATH)[keyof typeof FEATURE_PATH];

const AUTOMATION_TAB_PREFIX = "/automation/";

export function isAutomationTabPath(path: string): boolean {
  return path.startsWith(AUTOMATION_TAB_PREFIX);
}
