import { useMutation } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { useAutomationActions } from "@/modules/automation/hooks/useAutomationEditor";
import { automationKeys } from "@/utils/queryKeys";

interface UseRunAutomationMutationReturn {
  runAutomationMutation: UseMutateFunction<void, Error, string>;
  isRunPending: boolean;
}

export function useRunAutomationMutation(): UseRunAutomationMutationReturn {
  const actions = useAutomationActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...automationKeys.all, "run"],
    mutationFn: (at: string) => {
      actions.runNow(at);
      return Promise.resolve();
    },
  });
  return { runAutomationMutation: mutate, isRunPending: isPending };
}
