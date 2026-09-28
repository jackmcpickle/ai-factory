import { describe, expect, it } from 'vitest'
import { isZipFileName } from '@/modules/skill-library/helpers'
import {
  createSkillLibraryModel,
  skillLibraryReducer,
} from '@/modules/skill-library/reducer'
import type { SkillDraft } from '@/modules/skill-library/types'

const draft: SkillDraft = {
  name: 'Review helper',
  description: 'Checks a pull request summary',
  skill: 'Look at the diff before answering.',
  otherFiles: [{ name: 'notes.md', contents: 'extra' }],
  zipFileName: null,
}

describe('skill library', () => {
  it('rejects a zip that is not a zip', () => {
    expect(isZipFileName('notes.txt')).toBe(false)
    const model = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'RECORD_ZIP',
      fileName: 'notes.txt',
    })
    expect(model.pendingZipFileName).toBeNull()
  })

  it('clears a pending zip when a later file is not a zip', () => {
    const pending = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'RECORD_ZIP',
      fileName: 'review.zip',
    })
    const cleared = skillLibraryReducer(pending, {
      type: 'RECORD_ZIP',
      fileName: 'notes.txt',
    })
    expect(cleared.pendingZipFileName).toBeNull()
    const saved = skillLibraryReducer(cleared, {
      type: 'SUBMIT_SKILL',
      draft,
    })
    expect(saved.skills[0]?.zipFileName).toBeNull()
  })

  it('shows a chosen zip before submit and stores it on the skill', () => {
    const pending = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'RECORD_ZIP',
      fileName: 'review.zip',
    })
    expect(pending.pendingZipFileName).toBe('review.zip')
    const saved = skillLibraryReducer(pending, {
      type: 'SUBMIT_SKILL',
      draft: { ...draft, zipFileName: 'review.zip' },
    })
    expect(saved.pendingZipFileName).toBeNull()
    expect(saved.skills[0]?.zipFileName).toBe('review.zip')
    expect(saved.skills[0]?.loaded).toBe(false)
    expect(saved.skills[0]?.shared).toBe(false)
  })

  it('ignores an invalid skill', () => {
    const model = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'SUBMIT_SKILL',
      draft: { ...draft, name: '  ' },
    })
    expect(model.skills).toEqual([])
  })

  it('loads a skill into the project and shares it to the org', () => {
    const saved = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'SUBMIT_SKILL',
      draft,
    })
    const id = saved.skills[0]?.id
    if (!id) throw new Error('missing skill')
    const loaded = skillLibraryReducer(saved, { type: 'LOAD_SKILL', id })
    const shared = skillLibraryReducer(loaded, { type: 'SHARE_SKILL', id })
    expect(shared.skills[0]?.loaded).toBe(true)
    expect(shared.skills[0]?.shared).toBe(true)
    const missing = skillLibraryReducer(shared, {
      type: 'LOAD_SKILL',
      id: 'missing',
    })
    expect(missing).toBe(shared)
  })

  it('replaces the zip on a saved skill', () => {
    const saved = skillLibraryReducer(createSkillLibraryModel(), {
      type: 'SUBMIT_SKILL',
      draft,
    })
    const id = saved.skills[0]?.id
    if (!id) throw new Error('missing skill')
    const uploaded = skillLibraryReducer(saved, {
      type: 'UPLOAD_ZIP',
      id,
      fileName: 'pack.zip',
    })
    expect(uploaded.skills[0]?.zipFileName).toBe('pack.zip')
  })
})
