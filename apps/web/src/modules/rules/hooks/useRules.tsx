import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactElement, ReactNode } from 'react'
import { createRulesModel, rulesReducer } from '@/modules/rules/reducer'
import type { RuleDraft, RulesAction, RulesModel } from '@/modules/rules/types'

export type RulesActions = {
  add: (draft: RuleDraft) => void
  remove: (id: string) => void
  run: (id: string, at: string) => void
}

function bindRulesActions(dispatch: Dispatch<RulesAction>): RulesActions {
  return {
    add(draft) {
      dispatch({ type: 'ADD_RULE', draft })
    },
    remove(id) {
      dispatch({ type: 'REMOVE_RULE', id })
    },
    run(id, at) {
      dispatch({ type: 'RUN_RULE', id, at })
    },
  }
}

type RulesContextValue = {
  model: RulesModel
  actions: RulesActions
}

const RulesContext = createContext<RulesContextValue | null>(null)

export function RulesProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const [model, dispatch] = useReducer(
    rulesReducer,
    undefined,
    createRulesModel,
  )
  const actions = useMemo(() => bindRulesActions(dispatch), [])
  const value = useMemo(() => ({ model, actions }), [model, actions])
  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>
}

export function useRulesContext(): RulesContextValue {
  const value = useContext(RulesContext)
  if (!value) throw new Error('Rules provider is missing')
  return value
}

export function useRulesActions(): RulesActions {
  return useRulesContext().actions
}
