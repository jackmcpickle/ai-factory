import type { AppPart } from "@/lib/app-part";

export interface ValidatorDraft {
  instructions: string;
  target: AppPart;
  featureName: string;
  keywords: string[];
}

export interface ValidationReview {
  id: string;
  at: string;
  targetLabel: string;
  instructions: string;
  keywords: string[];
  headline: string;
  body: string;
}

interface ValidatorBase {
  nextId: number;
  reviews: ValidationReview[];
}

export type ValidatorModel =
  | (ValidatorBase & { type: "Ready"; error: null })
  | (ValidatorBase & { type: "Reviewed"; error: null })
  | (ValidatorBase & { type: "Invalid"; error: string });

export interface ValidatorAction {
  type: "RUN";
  draft: ValidatorDraft;
  at: string;
}
