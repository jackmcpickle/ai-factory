import { useMutation } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { useSkillLibraryActions } from "@/modules/skill-library/hooks/useSkillLibrary";
import { skillLibraryKeys } from "@/utils/queryKeys";

interface UseLoadSkillMutationReturn {
  loadSkillMutation: UseMutateFunction<void, Error, string>;
  isLoadPending: boolean;
}

export function useLoadSkillMutation(): UseLoadSkillMutationReturn {
  const actions = useSkillLibraryActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...skillLibraryKeys.all, "load"],
    mutationFn: (id: string) => {
      actions.load(id);
      return Promise.resolve();
    },
  });
  return { loadSkillMutation: mutate, isLoadPending: isPending };
}
