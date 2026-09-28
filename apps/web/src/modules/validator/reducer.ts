import { buildMockReview } from '@/modules/validator/helpers'
import { parseValidatorDraft } from '@/modules/validator/schemas/validator.schema'
import type { ValidatorAction, ValidatorModel } from '@/modules/validator/types'

export function createValidatorModel(): ValidatorModel {
  return { type: 'Ready', nextId: 1, reviews: [], error: null }
}

export function validatorReducer(
  model: ValidatorModel,
  action: ValidatorAction,
): ValidatorModel {
  const parsed = parseValidatorDraft(action.draft)
  if (!parsed.ok) {
    return {
      type: 'Invalid',
      nextId: model.nextId,
      reviews: model.reviews,
      error: parsed.error,
    }
  }
  const review = buildMockReview({
    id: `review_${model.nextId}`,
    at: action.at,
    draft: parsed.draft,
  })
  return {
    type: 'Reviewed',
    nextId: model.nextId + 1,
    reviews: [review, ...model.reviews],
    error: null,
  }
}
