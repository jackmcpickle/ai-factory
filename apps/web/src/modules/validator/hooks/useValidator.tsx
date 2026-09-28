import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactElement, ReactNode } from 'react'
import {
  createValidatorModel,
  validatorReducer,
} from '@/modules/validator/reducer'
import type {
  ValidatorAction,
  ValidatorDraft,
  ValidatorModel,
} from '@/modules/validator/types'

export type ValidatorActions = {
  run: (draft: ValidatorDraft, at: string) => void
}

function bindValidatorActions(
  dispatch: Dispatch<ValidatorAction>,
): ValidatorActions {
  return {
    run(draft, at) {
      dispatch({ type: 'RUN', draft, at })
    },
  }
}

type ValidatorContextValue = {
  model: ValidatorModel
  actions: ValidatorActions
}

const ValidatorContext = createContext<ValidatorContextValue | null>(null)

export function ValidatorProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const [model, dispatch] = useReducer(
    validatorReducer,
    undefined,
    createValidatorModel,
  )
  const actions = useMemo(() => bindValidatorActions(dispatch), [])
  const value = useMemo(() => ({ model, actions }), [model, actions])
  return (
    <ValidatorContext.Provider value={value}>
      {children}
    </ValidatorContext.Provider>
  )
}

export function useValidatorContext(): ValidatorContextValue {
  const value = useContext(ValidatorContext)
  if (!value) throw new Error('Validator provider is missing')
  return value
}

export function useValidatorActions(): ValidatorActions {
  return useValidatorContext().actions
}
