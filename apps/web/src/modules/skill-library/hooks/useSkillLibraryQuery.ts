import { useSkillLibraryContext } from '@/modules/skill-library/hooks/useSkillLibrary'
import type { SkillRecord } from '@/modules/skill-library/types'

interface UseSkillLibraryQueryReturn {
  skills: SkillRecord[]
  pendingZipFileName: string | null
  isSkillLibraryLoading: boolean
  isSkillLibraryError: boolean
}

export function useSkillLibraryQuery(): UseSkillLibraryQueryReturn {
  const { model } = useSkillLibraryContext()
  return {
    skills: model.skills,
    pendingZipFileName: model.pendingZipFileName,
    isSkillLibraryLoading: false,
    isSkillLibraryError: false,
  }
}
