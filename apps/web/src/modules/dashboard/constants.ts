import { AGENT_HREFS, AGENT_ID } from '@/modules/dashboard/types'
import type { AgentUsage } from '@/modules/dashboard/types'

export const SAMPLE_PERIOD_LABEL = 'Last 7 days'

export const SAMPLE_MERGED_PULL_REQUESTS = 14

export const SAMPLE_DEPLOYMENTS = 11

export const SAMPLE_TIME_TO_MERGE_MINUTES = 384

export const SAMPLE_AGENT_REVIEW_MINUTES = 22

export const SAMPLE_LEAD_TIME_MINUTES = 1080

export const SAMPLE_AGENTS = [
  {
    id: AGENT_ID.automations,
    label: 'Automations',
    href: AGENT_HREFS.automations,
    tokens: 1_260_000,
    costUsd: 8.4,
    timeMinutes: 252,
  },
  {
    id: AGENT_ID.skills,
    label: 'Skill library',
    href: AGENT_HREFS.skills,
    tokens: 315_000,
    costUsd: 2.1,
    timeMinutes: 48,
  },
  {
    id: AGENT_ID.validator,
    label: 'Validator',
    href: AGENT_HREFS.validator,
    tokens: 945_000,
    costUsd: 6.3,
    timeMinutes: 126,
  },
  {
    id: AGENT_ID.rules,
    label: 'Rules',
    href: AGENT_HREFS.rules,
    tokens: 462_000,
    costUsd: 3.08,
    timeMinutes: 36,
  },
] as const satisfies readonly AgentUsage[]
