import type { ReactElement } from 'react'
import { formatRunTimestamp, modelLabel } from '@/modules/automation/helpers'
import { useAutomationQuery } from '@/modules/automation/hooks/useAutomationQuery'

export function RunHistory(): ReactElement {
  const { runs, automation } = useAutomationQuery()
  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="run-history">
        No runs yet.
      </p>
    )
  }
  const newestFirst = runs.slice().reverse()
  return (
    <ul className="flex flex-col gap-2" data-testid="run-history">
      {newestFirst.map((run) => (
        <li key={run.id} className="rounded-md border px-3 py-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Manual run</span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRunTimestamp(run.at)} · {modelLabel(automation.modelId)}
          </p>
        </li>
      ))}
    </ul>
  )
}
