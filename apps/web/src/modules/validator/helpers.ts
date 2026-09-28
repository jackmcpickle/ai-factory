import { appPartLabel } from '@/lib/app-part'
import type {
  ValidationReview,
  ValidatorDraft,
} from '@/modules/validator/types'

export function addKeyword(keywords: readonly string[], raw: string): string[] {
  const next = raw.trim()
  if (next.length === 0) return [...keywords]
  const exists = keywords.some(
    (keyword) => keyword.toLowerCase() === next.toLowerCase(),
  )
  if (exists) return [...keywords]
  return [...keywords, next]
}

export function removeKeyword(
  keywords: readonly string[],
  keyword: string,
): string[] {
  return keywords.filter((item) => item !== keyword)
}

export function buildMockReview(input: {
  id: string
  at: string
  draft: ValidatorDraft
}): ValidationReview {
  const targetLabel = appPartLabel(input.draft.target, input.draft.featureName)
  const keywords = input.draft.keywords.map((keyword) => keyword.trim())
  return {
    id: input.id,
    at: input.at,
    targetLabel,
    instructions: input.draft.instructions.trim(),
    keywords,
    headline: `Mock review · ${targetLabel}`,
    body: `Checked ${targetLabel}. Looking out for ${keywords.join(', ')}.`,
  }
}
