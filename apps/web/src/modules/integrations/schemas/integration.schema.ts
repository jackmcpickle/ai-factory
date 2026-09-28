import { z } from 'zod'
import { formatZodError } from '@/lib/zod'
import { INTEGRATION_KINDS } from '@/modules/integrations/constants'
import { integrationValueError } from '@/modules/integrations/helpers'
import type { IntegrationDraft } from '@/modules/integrations/types'

export const integrationDraftSchema = z
  .object({
    kind: z.enum(INTEGRATION_KINDS),
    value: z.string().trim().min(1, 'Enter a connection value').max(200),
  })
  .superRefine((value, ctx) => {
    const message = integrationValueError(value.kind, value.value)
    if (message) {
      ctx.addIssue({ code: 'custom', message, path: ['value'] })
    }
  })

export type ParsedIntegrationDraft = z.infer<typeof integrationDraftSchema>

export function parseIntegrationDraft(
  draft: IntegrationDraft,
): { ok: true; draft: ParsedIntegrationDraft } | { ok: false; error: string } {
  const result = integrationDraftSchema.safeParse(draft)
  if (!result.success) return { ok: false, error: formatZodError(result.error) }
  return { ok: true, draft: result.data }
}
