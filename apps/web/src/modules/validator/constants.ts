import type { ValidatorDraft } from "@/modules/validator/types";

export const EMPTY_VALIDATOR_DRAFT = {
  instructions: "",
  target: "frontend",
  featureName: "",
  keywords: [],
} as const satisfies ValidatorDraft;
