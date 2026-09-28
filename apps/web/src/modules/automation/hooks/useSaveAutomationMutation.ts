import { useMutation } from '@tanstack/react-query'
import type { UseMutateFunction } from '@tanstack/react-query'
import { automationKeys } from '@/utils/queryKeys'
import { useAutomationActions } from '@/modules/automation/hooks/useAutomationEditor'

interface UseSaveAutomationMutationReturn {
  saveAutomationMutation: UseMutateFunction<void, Error, void>
  isSavePending: boolean
}

export function useSaveAutomationMutation(): UseSaveAutomationMutationReturn {
  const actions = useAutomationActions()
  const { mutate, isPending } = useMutation({
    mutationKey: [...automationKeys.all, 'save'],
    mutationFn: async () => {
      actions.save()
    },
  })
  return { saveAutomationMutation: mutate, isSavePending: isPending }
}
