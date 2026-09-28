import { useMutation } from '@tanstack/react-query'
import type { UseMutateFunction } from '@tanstack/react-query'
import { useSkillLibraryActions } from '@/modules/skill-library/hooks/useSkillLibrary'
import { skillLibraryKeys } from '@/utils/queryKeys'

interface UploadSkillZipInput {
  id?: string
  fileName: string
}

interface UseUploadSkillZipMutationReturn {
  uploadSkillZipMutation: UseMutateFunction<void, Error, UploadSkillZipInput>
  isUploadPending: boolean
}

export function useUploadSkillZipMutation(): UseUploadSkillZipMutationReturn {
  const actions = useSkillLibraryActions()
  const { mutate, isPending } = useMutation({
    mutationKey: [...skillLibraryKeys.all, 'upload'],
    mutationFn: async (input: UploadSkillZipInput) => {
      if (input.id) {
        actions.uploadZip(input.id, input.fileName)
        return
      }
      actions.recordZip(input.fileName)
    },
  })
  return { uploadSkillZipMutation: mutate, isUploadPending: isPending }
}
