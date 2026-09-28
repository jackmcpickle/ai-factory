import type { ReactElement } from 'react'
import {
  formatDuration,
  formatTokenCount,
  formatUsd,
} from '@/modules/dashboard/helpers'
import type { AgentUsage } from '@/modules/dashboard/types'

export function AgentUsageFigures({
  usage,
}: {
  usage: AgentUsage
}): ReactElement {
  return (
    <dl className="grid grid-cols-3 gap-3">
      <UsageStat label="Token spend" value={formatTokenCount(usage.tokens)} />
      <UsageStat label="Cost" value={formatUsd(usage.costUsd)} />
      <UsageStat label="Time" value={formatDuration(usage.timeMinutes)} />
    </dl>
  )
}

function UsageStat({
  label,
  value,
}: {
  label: string
  value: string
}): ReactElement {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm tabular-nums">{value}</dd>
    </div>
  )
}
