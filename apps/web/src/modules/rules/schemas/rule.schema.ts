import { z } from 'zod'
import { APP_PARTS, requireFeatureName } from '@/lib/app-part'
import { formatZodError } from '@/lib/zod'
import { RULE_MODE } from '@/modules/rules/types'
import type { RuleDraft } from '@/modules/rules/types'

export const ruleDraftSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80),
    check: z
      .string()
      .trim()
      .min(1, 'Write what the rule should check')
      .max(500),
    mode: z.enum([RULE_MODE.hold, RULE_MODE.absent]),
    target: z.enum(APP_PARTS),
    featureName: z.string().trim().max(80),
  })
  .superRefine((value, ctx) => {
    const featureError = requireFeatureName(value.target, value.featureName)
    if (featureError) {
      ctx.addIssue({
        code: 'custom',
        message: featureError,
        path: ['featureName'],
      })
    }
  })

export type ParsedRuleDraft = z.infer<typeof ruleDraftSchema>

export function parseRuleDraft(
  draft: RuleDraft,
): { ok: true; draft: ParsedRuleDraft } | { ok: false; error: string } {
  const result = ruleDraftSchema.safeParse(draft)
  if (!result.success) return { ok: false, error: formatZodError(result.error) }
  return { ok: true, draft: result.data }
}
