import type {
  AutomationTool,
  EventTriggerSource,
  ScheduleKind,
  Weekday,
} from '@/modules/automation/types'

export const DEFAULT_AUTOMATION_NAME = 'Untitled'

export const AUTHOR_NAME = 'Jack McNicol'

export const DEFAULT_MODEL_ID = 'grok-4.7-high-fast'

export const MODEL_OPTIONS = [
  { id: 'grok-4.7-high-fast', label: 'Grok 4.7 High Fast' },
  { id: 'grok-4.7-high', label: 'Grok 4.7 High' },
  { id: 'composer-2.5', label: 'Composer 2.5' },
  { id: 'claude-opus-4.6', label: 'Claude Opus 4.6' },
] as const

export const MODEL_IDS = [
  'grok-4.7-high-fast',
  'grok-4.7-high',
  'composer-2.5',
  'claude-opus-4.6',
] as const

export const REPOSITORIES = [
  { id: 'qantas-ai', label: 'jackmcpickle/Qantas-AI' },
  { id: 'cursor', label: 'jackmcpickle/cursor' },
  { id: 'web', label: 'jackmcpickle/web' },
] as const

export const REPOSITORY_IDS = ['qantas-ai', 'cursor', 'web'] as const

export const HOURLY_MINUTES = [0, 15, 30, 45] as const

export const DAILY_TIMES = ['09:00', '12:00', '17:00', '21:00'] as const

export const WEEKDAY_IDS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly Weekday[]

export const WEEKDAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
] as const satisfies ReadonlyArray<{ id: Weekday; label: string }>

export const SCHEDULE_OPTIONS = [
  { kind: 'hourly', label: 'Hourly' },
  { kind: 'daily', label: 'Daily' },
  { kind: 'weekly', label: 'Weekly' },
  { kind: 'custom', label: 'Custom' },
] as const satisfies ReadonlyArray<{ kind: ScheduleKind; label: string }>

export const EVENT_TRIGGER_OPTIONS = [
  { source: 'github', label: 'GitHub' },
  { source: 'slack', label: 'Slack' },
  { source: 'teams', label: 'Microsoft Teams' },
  { source: 'sentry', label: 'Sentry' },
  { source: 'linear', label: 'Linear' },
  { source: 'webhook', label: 'Webhook Triggered' },
  { source: 'pagerduty', label: 'PagerDuty' },
] as const satisfies ReadonlyArray<{
  source: EventTriggerSource
  label: string
}>

export const MEMORIES_TOOL = {
  id: 'memories',
  name: 'Memories',
  kind: 'memories',
} as const satisfies AutomationTool

export const TOOL_CATALOG = [
  { id: 'memories', name: 'Memories', kind: 'memories' },
  { id: 'slack', name: 'Slack', kind: 'mcp' },
  { id: 'github', name: 'GitHub', kind: 'mcp' },
  { id: 'linear', name: 'Linear', kind: 'mcp' },
  { id: 'web-search', name: 'Web search', kind: 'tool' },
  { id: 'filesystem', name: 'Filesystem', kind: 'tool' },
] as const satisfies ReadonlyArray<AutomationTool>
