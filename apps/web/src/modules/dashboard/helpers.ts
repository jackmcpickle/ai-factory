import {
  SAMPLE_AGENT_REVIEW_MINUTES,
  SAMPLE_AGENTS,
  SAMPLE_DEPLOYMENTS,
  SAMPLE_LEAD_TIME_MINUTES,
  SAMPLE_MERGED_PULL_REQUESTS,
  SAMPLE_PERIOD_LABEL,
  SAMPLE_TIME_TO_MERGE_MINUTES,
} from '@/modules/dashboard/constants'
import { AGENT_IDS, DELIVERY_METRIC_ID } from '@/modules/dashboard/types'
import type {
  AgentId,
  AgentUsage,
  DashboardSnapshot,
  DeliveryMetric,
} from '@/modules/dashboard/types'

export function isAgentId(value: string): value is AgentId {
  return AGENT_IDS.some((id) => id === value)
}

export function sectionHasTokenMetrics(section: string): boolean {
  return isAgentId(section)
}

export function formatTokenCount(tokens: number): string {
  assertNonNegativeInteger(tokens, 'Token count')
  if (tokens >= 999_500) {
    return `${compact(tokens / 1_000_000)}M`
  }
  if (tokens >= 1_000) {
    return `${compact(tokens / 1_000)}k`
  }
  return String(tokens)
}

export function formatDuration(minutes: number): string {
  assertNonNegativeInteger(minutes, 'Duration')
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Cost must be a non-negative finite number')
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function totalAgentCostUsd(agents: readonly AgentUsage[]): number {
  assertAgentCosts(agents)
  const total = agents.reduce((sum, agent) => sum + agent.costUsd, 0)
  return roundCents(total)
}

export function tokenCostPerPullRequest(
  agents: readonly AgentUsage[],
  mergedPullRequests: number,
): number {
  if (!Number.isInteger(mergedPullRequests) || mergedPullRequests < 1) {
    throw new Error('Merged pull requests must be a positive integer')
  }
  assertAgentCosts(agents)
  return roundCents(totalAgentCostUsd(agents) / mergedPullRequests)
}

export function findAgentUsage(
  agents: readonly AgentUsage[],
  agentId: AgentId,
): AgentUsage | undefined {
  return agents.find((agent) => agent.id === agentId)
}

export function buildDashboardSnapshot(): DashboardSnapshot {
  const agents: AgentUsage[] = SAMPLE_AGENTS.map((agent) => ({ ...agent }))
  const costPerPr = tokenCostPerPullRequest(agents, SAMPLE_MERGED_PULL_REQUESTS)
  const metrics: DeliveryMetric[] = [
    {
      id: DELIVERY_METRIC_ID.timeToMerge,
      label: 'Time to merge',
      value: formatDuration(SAMPLE_TIME_TO_MERGE_MINUTES),
      detail: 'Median from open to merge',
    },
    {
      id: DELIVERY_METRIC_ID.deployments,
      label: 'Deployments',
      value: String(SAMPLE_DEPLOYMENTS),
      detail: 'Production releases',
    },
    {
      id: DELIVERY_METRIC_ID.tokenCostPerPr,
      label: 'Cost of tokens per PR',
      value: formatUsd(costPerPr),
      detail: 'Agent spend divided by merged pull requests',
    },
    {
      id: DELIVERY_METRIC_ID.agentReviewTime,
      label: 'Time in agent review',
      value: formatDuration(SAMPLE_AGENT_REVIEW_MINUTES),
      detail: 'Median per pull request',
    },
    {
      id: DELIVERY_METRIC_ID.pullRequestsMerged,
      label: 'Pull requests merged',
      value: String(SAMPLE_MERGED_PULL_REQUESTS),
      detail: 'Merged in this window',
    },
    {
      id: DELIVERY_METRIC_ID.leadTime,
      label: 'Lead time',
      value: formatDuration(SAMPLE_LEAD_TIME_MINUTES),
      detail: 'Median from first commit to deploy',
    },
  ]
  return {
    periodLabel: SAMPLE_PERIOD_LABEL,
    metrics,
    agents,
  }
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`)
  }
}

function assertAgentCosts(agents: readonly AgentUsage[]): void {
  const invalid = agents.some(
    (agent) => !Number.isFinite(agent.costUsd) || agent.costUsd < 0,
  )
  if (invalid) {
    throw new Error('Agent cost must be a non-negative finite number')
  }
}

function roundCents(amount: number): number {
  return Math.round(amount * 100) / 100
}

function compact(value: number): string {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/0$/, '')
}
