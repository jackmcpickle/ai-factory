import { useMutation } from '@tanstack/react-query'
import type { UseMutateAsyncFunction } from '@tanstack/react-query'
import { parseValidatorDraft } from '@/modules/validator/schemas/validator.schema'
import { useValidatorActions } from '@/modules/validator/hooks/useValidator'
import type { ValidatorDraft } from '@/modules/validator/types'
import { validatorKeys } from '@/utils/queryKeys'

interface UseRunValidationMutationReturn {
  runValidationMutationAsync: UseMutateAsyncFunction<
    ValidatorDraft,
    Error,
    ValidatorDraft
  >
  isRunPending: boolean
}

export function useRunValidationMutation(): UseRunValidationMutationReturn {
  const actions = useValidatorActions()
  const { mutateAsync, isPending } = useMutation({
    mutationKey: [...validatorKeys.all, 'run'],
    mutationFn: async (draft: ValidatorDraft) => {
      const parsed = parseValidatorDraft(draft)
      if (!parsed.ok) throw new Error(parsed.error)
      actions.run(parsed.draft, new Date().toISOString())
      return parsed.draft
    },
  })
  return { runValidationMutationAsync: mutateAsync, isRunPending: isPending }
}
