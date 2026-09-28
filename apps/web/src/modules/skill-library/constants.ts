import type { SkillDraft } from '@/modules/skill-library/types'

export const EMPTY_SKILL_DRAFT = {
  name: '',
  description: '',
  skill: '',
  otherFiles: [],
  zipFileName: null,
} as const satisfies SkillDraft
