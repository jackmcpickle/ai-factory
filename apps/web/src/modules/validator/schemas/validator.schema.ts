import { z } from "zod";

import { APP_PARTS, requireFeatureName } from "@/lib/app-part";
import { formatZodError } from "@/lib/zod";
import type { ValidatorDraft } from "@/modules/validator/types";

export const validatorDraftSchema = z
  .object({
    instructions: z
      .string()
      .trim()
      .min(1, "Instructions are required")
      .max(4000),
    target: z.enum(APP_PARTS),
    featureName: z.string().trim().max(80),
    keywords: z
      .array(z.string().trim().min(1).max(40))
      .min(1, "Add at least one keyword"),
  })
  .superRefine((value, ctx) => {
    const featureError = requireFeatureName(value.target, value.featureName);
    if (featureError) {
      ctx.addIssue({
        code: "custom",
        message: featureError,
        path: ["featureName"],
      });
    }
  });

export type ParsedValidatorDraft = z.infer<typeof validatorDraftSchema>;

export function parseValidatorDraft(
  draft: ValidatorDraft
): { ok: true; draft: ParsedValidatorDraft } | { ok: false; error: string } {
  const result = validatorDraftSchema.safeParse(draft);
  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }
  return { ok: true, draft: result.data };
}
