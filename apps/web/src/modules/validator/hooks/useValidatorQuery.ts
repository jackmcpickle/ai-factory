import { useValidatorContext } from '@/modules/validator/hooks/useValidator'
import type { ValidationReview } from '@/modules/validator/types'

interface UseValidatorQueryReturn {
  reviews: ValidationReview[]
  error: string | null
  isValidatorLoading: boolean
  isValidatorError: boolean
}

export function useValidatorQuery(): UseValidatorQueryReturn {
  const { model } = useValidatorContext()
  return {
    reviews: model.reviews,
    error: model.error,
    isValidatorLoading: false,
    isValidatorError: model.type === 'Invalid',
  }
}
