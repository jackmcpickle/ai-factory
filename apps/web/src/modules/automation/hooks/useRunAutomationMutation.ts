import { useMutation } from '@tanstack/react-query'
import type { UseMutateFunction } from '@tanstack/react-query'
import { automationKeys } from '@/utils/queryKeys'
import { useAutomationActions } from '@/modules/automation/hooks/useAutomationEditor'

interface UseRunAutomationMutationReturn {
  runAutomationMutation: UseMutateFunction<void, Error, string>
  isRunPending: boolean
}

export function useRunAutomationMutation(): UseRunAutomationMutationReturn {
  const actions = useAutomationActions()
  const { mutate, isPending } = useMutation({
    mutationKey: [...automationKeys.all, 'run'],
    mutationFn: async (at: string) => {
      actions.runNow(at)
    },
  })
  return { runAutomationMutation: mutate, isRunPending: isPending }
}
