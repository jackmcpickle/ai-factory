import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactElement, ReactNode } from 'react'
import {
  createIntegrationsModel,
  integrationsReducer,
} from '@/modules/integrations/reducer'
import type {
  IntegrationDraft,
  IntegrationsAction,
  IntegrationsModel,
} from '@/modules/integrations/types'

export type IntegrationsActions = {
  connect: (draft: IntegrationDraft) => void
  disconnect: (id: string) => void
  reconnect: (id: string) => void
  remove: (id: string) => void
}

function bindIntegrationsActions(
  dispatch: Dispatch<IntegrationsAction>,
): IntegrationsActions {
  return {
    connect(draft) {
      dispatch({ type: 'CONNECT', draft })
    },
    disconnect(id) {
      dispatch({ type: 'DISCONNECT', id })
    },
    reconnect(id) {
      dispatch({ type: 'RECONNECT', id })
    },
    remove(id) {
      dispatch({ type: 'REMOVE', id })
    },
  }
}

type IntegrationsContextValue = {
  model: IntegrationsModel
  actions: IntegrationsActions
}

const IntegrationsContext = createContext<IntegrationsContextValue | null>(null)

export function IntegrationsProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const [model, dispatch] = useReducer(
    integrationsReducer,
    undefined,
    createIntegrationsModel,
  )
  const actions = useMemo(() => bindIntegrationsActions(dispatch), [])
  const value = useMemo(() => ({ model, actions }), [model, actions])
  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  )
}

export function useIntegrationsContext(): IntegrationsContextValue {
  const value = useContext(IntegrationsContext)
  if (!value) throw new Error('Integrations provider is missing')
  return value
}

export function useIntegrationsActions(): IntegrationsActions {
  return useIntegrationsContext().actions
}
