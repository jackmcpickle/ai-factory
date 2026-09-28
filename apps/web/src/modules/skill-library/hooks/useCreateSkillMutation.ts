import { useMutation } from '@tanstack/react-query'
import type {
  UseMutateAsyncFunction,
  UseMutateFunction,
} from '@tanstack/react-query'
import { parseSkillDraft } from '@/modules/skill-library/schemas/skill.schema'
import { useSkillLibraryActions } from '@/modules/skill-library/hooks/useSkillLibrary'
import type { SkillDraft } from '@/modules/skill-library/types'
import { skillLibraryKeys } from '@/utils/queryKeys'

interface UseCreateSkillMutationReturn {
  createSkillMutation: UseMutateFunction<SkillDraft, Error, SkillDraft>
  createSkillMutationAsync: UseMutateAsyncFunction<
    SkillDraft,
    Error,
    SkillDraft
  >
  isCreatePending: boolean
}

async function createSkillRequest(
  draft: SkillDraft,
  submit: (draft: SkillDraft) => void,
): Promise<SkillDraft> {
  const parsed = parseSkillDraft(draft)
  if (!parsed.ok) throw new Error(parsed.error)
  submit(parsed.draft)
  return parsed.draft
}

export function useCreateSkillMutation(): UseCreateSkillMutationReturn {
  const actions = useSkillLibraryActions()
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationKey: [...skillLibraryKeys.all, 'create'],
    mutationFn: (draft: SkillDraft) =>
      createSkillRequest(draft, actions.submit),
  })
  return {
    createSkillMutation: mutate,
    createSkillMutationAsync: mutateAsync,
    isCreatePending: isPending,
  }
}
