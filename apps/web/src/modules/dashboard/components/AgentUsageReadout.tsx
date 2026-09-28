import type { ReactElement } from 'react'
import { AgentUsageFigures } from '@/modules/dashboard/components/AgentUsageFigures'
import { findAgentUsage } from '@/modules/dashboard/helpers'
import { useDashboardQuery } from '@/modules/dashboard/hooks/useDashboardQuery'
import type { AgentId } from '@/modules/dashboard/types'

export function AgentUsageReadout({
  agentId,
}: {
  agentId: AgentId
}): ReactElement | null {
  const { snapshot, isDashboardLoading, isDashboardError } = useDashboardQuery()
  if (isDashboardLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading sample usage.</p>
    )
  }
  if (isDashboardError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Sample usage is unavailable.
      </p>
    )
  }
  const usage = findAgentUsage(snapshot.agents, agentId)
  if (!usage) return null
  return (
    <section
      aria-label={`${usage.label} usage`}
      data-testid={`agent-usage-${agentId}`}
      className="rounded-md border px-3 py-3"
    >
      <h2 className="text-[12px] text-muted-foreground">
        Sample usage · {snapshot.periodLabel}
      </h2>
      <div className="mt-2">
        <AgentUsageFigures usage={usage} />
      </div>
    </section>
  )
}
