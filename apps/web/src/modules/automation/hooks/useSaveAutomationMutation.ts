import { useMutation } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { useAutomationActions } from "@/modules/automation/hooks/useAutomationEditor";
import { automationKeys } from "@/utils/queryKeys";

interface UseSaveAutomationMutationReturn {
  saveAutomationMutation: UseMutateFunction<void, Error, void>;
  isSavePending: boolean;
}

export function useSaveAutomationMutation(): UseSaveAutomationMutationReturn {
  const actions = useAutomationActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...automationKeys.all, "save"],
    mutationFn: () => {
      actions.save();
      return Promise.resolve();
    },
  });
  return { saveAutomationMutation: mutate, isSavePending: isPending };
}
