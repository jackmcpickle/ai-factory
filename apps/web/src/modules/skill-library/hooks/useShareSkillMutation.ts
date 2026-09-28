import { useMutation } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { useSkillLibraryActions } from "@/modules/skill-library/hooks/useSkillLibrary";
import { skillLibraryKeys } from "@/utils/queryKeys";

interface UseShareSkillMutationReturn {
  shareSkillMutation: UseMutateFunction<void, Error, string>;
  isSharePending: boolean;
}

export function useShareSkillMutation(): UseShareSkillMutationReturn {
  const actions = useSkillLibraryActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...skillLibraryKeys.all, "share"],
    mutationFn: (id: string) => {
      actions.share(id);
      return Promise.resolve();
    },
  });
  return { shareSkillMutation: mutate, isSharePending: isPending };
}
