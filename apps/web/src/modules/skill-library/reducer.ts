import { isZipFileName } from '@/modules/skill-library/helpers'
import { parseSkillDraft } from '@/modules/skill-library/schemas/skill.schema'
import type {
  SkillLibraryAction,
  SkillLibraryModel,
  SkillRecord,
} from '@/modules/skill-library/types'

export function createSkillLibraryModel(): SkillLibraryModel {
  return {
    type: 'Ready',
    nextId: 1,
    skills: [],
    pendingZipFileName: null,
  }
}

function replaceSkill(
  skills: SkillRecord[],
  id: string,
  update: (skill: SkillRecord) => SkillRecord,
): SkillRecord[] | null {
  const index = skills.findIndex((skill) => skill.id === id)
  if (index < 0) return null
  const current = skills[index]
  const next = skills.slice()
  next[index] = update(current)
  return next
}

export function skillLibraryReducer(
  model: SkillLibraryModel,
  action: SkillLibraryAction,
): SkillLibraryModel {
  switch (action.type) {
    case 'RECORD_ZIP':
      if (!isZipFileName(action.fileName)) return model
      return { ...model, pendingZipFileName: action.fileName.trim() }
    case 'CLEAR_ZIP':
      return { ...model, pendingZipFileName: null }
    case 'SUBMIT_SKILL': {
      const parsed = parseSkillDraft(action.draft)
      if (!parsed.ok) return model
      const zipFileName = parsed.draft.zipFileName ?? model.pendingZipFileName
      const skill: SkillRecord = {
        id: `skill_${model.nextId}`,
        name: parsed.draft.name,
        description: parsed.draft.description,
        skill: parsed.draft.skill,
        otherFiles: parsed.draft.otherFiles,
        zipFileName,
        loaded: false,
        shared: false,
      }
      return {
        type: 'Ready',
        nextId: model.nextId + 1,
        pendingZipFileName: null,
        skills: [...model.skills, skill],
      }
    }
    case 'LOAD_SKILL': {
      const skills = replaceSkill(model.skills, action.id, (skill) => ({
        ...skill,
        loaded: true,
      }))
      if (!skills) return model
      return { ...model, skills }
    }
    case 'SHARE_SKILL': {
      const skills = replaceSkill(model.skills, action.id, (skill) => ({
        ...skill,
        shared: true,
      }))
      if (!skills) return model
      return { ...model, skills }
    }
    case 'UPLOAD_ZIP': {
      if (!isZipFileName(action.fileName)) return model
      const skills = replaceSkill(model.skills, action.id, (skill) => ({
        ...skill,
        zipFileName: action.fileName.trim(),
      }))
      if (!skills) return model
      return { ...model, skills }
    }
    default: {
      const unreachable: never = action
      return unreachable
    }
  }
}
