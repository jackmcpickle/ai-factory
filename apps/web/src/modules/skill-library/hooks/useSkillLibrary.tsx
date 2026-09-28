import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactElement, ReactNode } from 'react'
import {
  createSkillLibraryModel,
  skillLibraryReducer,
} from '@/modules/skill-library/reducer'
import type {
  SkillDraft,
  SkillLibraryAction,
  SkillLibraryModel,
} from '@/modules/skill-library/types'

export type SkillLibraryActions = {
  recordZip: (fileName: string) => void
  clearZip: () => void
  submit: (draft: SkillDraft) => void
  load: (id: string) => void
  share: (id: string) => void
  uploadZip: (id: string, fileName: string) => void
}

function bindSkillLibraryActions(
  dispatch: Dispatch<SkillLibraryAction>,
): SkillLibraryActions {
  return {
    recordZip(fileName) {
      dispatch({ type: 'RECORD_ZIP', fileName })
    },
    clearZip() {
      dispatch({ type: 'CLEAR_ZIP' })
    },
    submit(draft) {
      dispatch({ type: 'SUBMIT_SKILL', draft })
    },
    load(id) {
      dispatch({ type: 'LOAD_SKILL', id })
    },
    share(id) {
      dispatch({ type: 'SHARE_SKILL', id })
    },
    uploadZip(id, fileName) {
      dispatch({ type: 'UPLOAD_ZIP', id, fileName })
    },
  }
}

type SkillLibraryContextValue = {
  model: SkillLibraryModel
  actions: SkillLibraryActions
}

const SkillLibraryContext = createContext<SkillLibraryContextValue | null>(null)

export function SkillLibraryProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const [model, dispatch] = useReducer(
    skillLibraryReducer,
    undefined,
    createSkillLibraryModel,
  )
  const actions = useMemo(() => bindSkillLibraryActions(dispatch), [])
  const value = useMemo(() => ({ model, actions }), [model, actions])
  return (
    <SkillLibraryContext.Provider value={value}>
      {children}
    </SkillLibraryContext.Provider>
  )
}

export function useSkillLibraryContext(): SkillLibraryContextValue {
  const value = useContext(SkillLibraryContext)
  if (!value) throw new Error('Skill library provider is missing')
  return value
}

export function useSkillLibraryActions(): SkillLibraryActions {
  return useSkillLibraryContext().actions
}
