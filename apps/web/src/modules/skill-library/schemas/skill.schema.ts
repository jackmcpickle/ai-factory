import { z } from "zod";

import { formatZodError } from "@/lib/zod";
import { isZipFileName } from "@/modules/skill-library/helpers";

const skillFileSchema = z.object({
  name: z.string().trim().min(1, "File name is required").max(120),
  contents: z.string().max(20_000),
});

export const skillDraftSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    description: z.string().trim().min(1, "Description is required").max(500),
    skill: z.string().trim().min(1, "Skill file is required").max(20_000),
    otherFiles: z.array(skillFileSchema),
    zipFileName: z.string().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.zipFileName !== null && !isZipFileName(value.zipFileName)) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a .zip file",
        path: ["zipFileName"],
      });
    }
  });

export type ParsedSkillDraft = z.infer<typeof skillDraftSchema>;

export function parseSkillDraft(
  draft: unknown
): { ok: true; draft: ParsedSkillDraft } | { ok: false; error: string } {
  const result = skillDraftSchema.safeParse(draft);
  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }
  return { ok: true, draft: result.data };
}
