import { describe, expect, it } from 'vitest'
import { integrationValueError } from '@/modules/integrations/helpers'
import {
  createIntegrationsModel,
  integrationsReducer,
} from '@/modules/integrations/reducer'

describe('integration fields', () => {
  it('checks email addresses and webhook URLs locally', () => {
    expect(integrationValueError('email', 'ops@example.com')).toBeNull()
    expect(integrationValueError('email', 'not-an-email')).toBe(
      'Enter an email address',
    )
    expect(
      integrationValueError('webhook', 'https://example.com/hooks/automation'),
    ).toBeNull()
    expect(integrationValueError('webhook', 'example.com')).toBe(
      'Enter a webhook URL',
    )
    expect(integrationValueError('slack', '#releases')).toBeNull()
  })
})

describe('integration connections', () => {
  it('connects, disconnects, reconnects, and removes a local integration', () => {
    const connected = integrationsReducer(createIntegrationsModel(), {
      type: 'CONNECT',
      draft: { kind: 'slack', value: '  #releases  ' },
    })
    const connection = connected.connections[0]
    expect(connection.status).toBe('connected')
    expect(connection.value).toBe('#releases')
    const disconnected = integrationsReducer(connected, {
      type: 'DISCONNECT',
      id: connection.id,
    })
    expect(disconnected.connections[0]?.status).toBe('disconnected')
    const restored = integrationsReducer(disconnected, {
      type: 'RECONNECT',
      id: connection.id,
    })
    expect(restored.connections[0]?.status).toBe('connected')
    const removed = integrationsReducer(restored, {
      type: 'REMOVE',
      id: connection.id,
    })
    expect(removed.connections).toEqual([])
  })

  it('rejects an invalid email and a duplicate connection', () => {
    const invalid = integrationsReducer(createIntegrationsModel(), {
      type: 'CONNECT',
      draft: { kind: 'email', value: 'ops' },
    })
    expect(invalid.type).toBe('Invalid')
    expect(invalid.connections).toEqual([])
    const once = integrationsReducer(createIntegrationsModel(), {
      type: 'CONNECT',
      draft: { kind: 'jira', value: 'QANTAS' },
    })
    const twice = integrationsReducer(once, {
      type: 'CONNECT',
      draft: { kind: 'jira', value: 'QANTAS' },
    })
    expect(twice.type).toBe('Invalid')
    expect(twice.connections).toHaveLength(1)
  })
})
