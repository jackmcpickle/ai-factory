import type { FormEvent, ReactElement } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { INTEGRATION_CATALOG } from '@/modules/integrations/constants'
import { catalogEntry, isIntegrationKind } from '@/modules/integrations/helpers'
import { useIntegrationForm } from '@/modules/integrations/hooks/useIntegrationForm'
import {
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
  useRemoveIntegrationMutation,
} from '@/modules/integrations/hooks/useIntegrationMutations'
import { useIntegrationsActions } from '@/modules/integrations/hooks/useIntegrations'
import { useIntegrationsQuery } from '@/modules/integrations/hooks/useIntegrationsQuery'
import { integrationDraftSchema } from '@/modules/integrations/schemas/integration.schema'
import type {
  IntegrationConnection,
  IntegrationKind,
} from '@/modules/integrations/types'

export function IntegrationsPanel(): ReactElement {
  const { connections, error } = useIntegrationsQuery()
  const { connectIntegrationMutationAsync } = useConnectIntegrationMutation()
  const form = useIntegrationForm({
    defaultValues: { kind: 'slack', value: '' },
    validators: { onSubmit: integrationDraftSchema },
    onSubmit: async ({ value }) => {
      if (!isIntegrationKind(value.kind)) return
      await connectIntegrationMutationAsync({
        kind: value.kind,
        value: value.value,
      })
      form.reset()
      form.setFieldValue('kind', value.kind)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  function handlePick(next: IntegrationKind): void {
    form.setFieldValue('kind', next)
    form.setFieldValue('value', '')
  }

  return (
    <div className="flex flex-col gap-6">
      <form.Subscribe selector={(state) => state.values.kind}>
        {(kind) => {
          if (!isIntegrationKind(kind)) return null
          const entry = catalogEntry(kind)
          return (
            <>
              <ul className="grid gap-2 sm:grid-cols-2">
                {INTEGRATION_CATALOG.map((item) => (
                  <li key={item.kind}>
                    <button
                      type="button"
                      aria-pressed={item.kind === kind}
                      onClick={() => handlePick(item.kind)}
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-left text-sm',
                        item.kind === kind
                          ? 'border-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                data-testid="integration-form"
              >
                <form.AppField name="value">
                  {(field) => (
                    <field.TextField
                      label={entry.fieldLabel}
                      placeholder={entry.placeholder}
                    />
                  )}
                </form.AppField>
                <ConnectionError message={error} />
                <form.AppForm>
                  <form.SubmitButton
                    label={`Connect ${entry.name}`}
                    pendingLabel="Connecting..."
                  />
                </form.AppForm>
              </form>
            </>
          )
        }}
      </form.Subscribe>
      <ConnectionList connections={connections} />
    </div>
  )
}

function ConnectionError({
  message,
}: {
  message: string | null
}): ReactElement | null {
  if (!message) return null
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}

function ConnectionList({
  connections,
}: {
  connections: IntegrationConnection[]
}): ReactElement {
  if (connections.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-testid="integration-list"
      >
        Nothing is connected yet.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-3" data-testid="integration-list">
      {connections.map((connection) => (
        <ConnectionCard key={connection.id} connection={connection} />
      ))}
    </ul>
  )
}

function ConnectionCard({
  connection,
}: {
  connection: IntegrationConnection
}): ReactElement {
  const actions = useIntegrationsActions()
  const { disconnectIntegrationMutation } = useDisconnectIntegrationMutation()
  const { removeIntegrationMutation } = useRemoveIntegrationMutation()
  const connected = connection.status === 'connected'
  return (
    <li className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{connection.name}</h3>
          <p className="text-xs text-muted-foreground">
            {connection.fieldLabel}: {connection.value}
          </p>
        </div>
        <span className="text-xs">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="flex gap-2">
        {connected ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => disconnectIntegrationMutation(connection.id)}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => actions.reconnect(connection.id)}
          >
            Reconnect
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => removeIntegrationMutation(connection.id)}
        >
          Remove
        </Button>
      </div>
    </li>
  )
}
