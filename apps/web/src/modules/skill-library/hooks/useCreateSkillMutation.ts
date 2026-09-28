import { useMutation } from "@tanstack/react-query";
import type {
  UseMutateAsyncFunction,
  UseMutateFunction,
} from "@tanstack/react-query";

import { useSkillLibraryActions } from "@/modules/skill-library/hooks/useSkillLibrary";
import { parseSkillDraft } from "@/modules/skill-library/schemas/skill.schema";
import type { SkillDraft } from "@/modules/skill-library/types";
import { skillLibraryKeys } from "@/utils/queryKeys";

interface UseCreateSkillMutationReturn {
  createSkillMutation: UseMutateFunction<SkillDraft, Error, SkillDraft>;
  createSkillMutationAsync: UseMutateAsyncFunction<
    SkillDraft,
    Error,
    SkillDraft
  >;
  isCreatePending: boolean;
}

function createSkillRequest(
  draft: SkillDraft,
  submit: (draft: SkillDraft) => void
): Promise<SkillDraft> {
  const parsed = parseSkillDraft(draft);
  if (!parsed.ok) {
    return Promise.reject(new Error(parsed.error));
  }
  submit(parsed.draft);
  return Promise.resolve(parsed.draft);
}

export function useCreateSkillMutation(): UseCreateSkillMutationReturn {
  const actions = useSkillLibraryActions();
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationKey: [...skillLibraryKeys.all, "create"],
    mutationFn: (draft: SkillDraft) =>
      createSkillRequest(draft, actions.submit),
  });
  return {
    createSkillMutation: mutate,
    createSkillMutationAsync: mutateAsync,
    isCreatePending: isPending,
  };
}
