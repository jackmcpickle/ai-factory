import type { RuleDraft } from "@/modules/rules/types";

export const EMPTY_RULE_DRAFT = {
  name: "",
  check: "",
  mode: "hold",
  target: "frontend",
  featureName: "",
} as const satisfies RuleDraft;

export const RULE_MODE_OPTIONS = [
  { value: "hold", label: "Must hold" },
  { value: "absent", label: "Must not appear" },
] as const;
