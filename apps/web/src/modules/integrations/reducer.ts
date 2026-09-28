import {
  catalogEntry,
  normalizeIntegrationValue,
} from '@/modules/integrations/helpers'
import { parseIntegrationDraft } from '@/modules/integrations/schemas/integration.schema'
import type {
  IntegrationConnection,
  IntegrationsAction,
  IntegrationsModel,
} from '@/modules/integrations/types'

export function createIntegrationsModel(): IntegrationsModel {
  return { type: 'Ready', nextId: 1, connections: [], error: null }
}

function replaceConnection(
  connections: IntegrationConnection[],
  id: string,
  update: (connection: IntegrationConnection) => IntegrationConnection,
): IntegrationConnection[] | null {
  const index = connections.findIndex((item) => item.id === id)
  if (index < 0) return null
  const current = connections[index]
  const next = connections.slice()
  next[index] = update(current)
  return next
}

export function integrationsReducer(
  model: IntegrationsModel,
  action: IntegrationsAction,
): IntegrationsModel {
  switch (action.type) {
    case 'CONNECT': {
      const parsed = parseIntegrationDraft(action.draft)
      if (!parsed.ok) return { ...model, type: 'Invalid', error: parsed.error }
      const value = normalizeIntegrationValue(
        parsed.draft.kind,
        parsed.draft.value,
      )
      const duplicate = model.connections.some(
        (item) => item.kind === parsed.draft.kind && item.value === value,
      )
      if (duplicate) {
        return {
          ...model,
          type: 'Invalid',
          error: 'That integration is already in the list',
        }
      }
      const entry = catalogEntry(parsed.draft.kind)
      const connection: IntegrationConnection = {
        id: `integration_${model.nextId}`,
        kind: parsed.draft.kind,
        name: entry.name,
        fieldLabel: entry.fieldLabel,
        value,
        status: 'connected',
      }
      return {
        type: 'Ready',
        nextId: model.nextId + 1,
        connections: [...model.connections, connection],
        error: null,
      }
    }
    case 'DISCONNECT': {
      const connections = replaceConnection(
        model.connections,
        action.id,
        (connection) => ({ ...connection, status: 'disconnected' }),
      )
      if (!connections) return model
      return { ...model, type: 'Ready', connections, error: null }
    }
    case 'RECONNECT': {
      const connections = replaceConnection(
        model.connections,
        action.id,
        (connection) => ({ ...connection, status: 'connected' }),
      )
      if (!connections) return model
      return { ...model, type: 'Ready', connections, error: null }
    }
    case 'REMOVE':
      return {
        type: 'Ready',
        nextId: model.nextId,
        connections: model.connections.filter((item) => item.id !== action.id),
        error: null,
      }
    default: {
      const unreachable: never = action
      return unreachable
    }
  }
}
