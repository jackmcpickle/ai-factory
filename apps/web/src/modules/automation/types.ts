export const AUTOMATION_TAB = {
  settings: 'settings',
  history: 'history',
} as const

export type AutomationTab = (typeof AUTOMATION_TAB)[keyof typeof AUTOMATION_TAB]

export const EVENT_TRIGGER_SOURCE = {
  github: 'github',
  slack: 'slack',
  teams: 'teams',
  sentry: 'sentry',
  linear: 'linear',
  webhook: 'webhook',
  pagerduty: 'pagerduty',
} as const

export type EventTriggerSource =
  (typeof EVENT_TRIGGER_SOURCE)[keyof typeof EVENT_TRIGGER_SOURCE]

export const SCHEDULE_KIND = {
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
  custom: 'custom',
} as const

export type ScheduleKind = (typeof SCHEDULE_KIND)[keyof typeof SCHEDULE_KIND]

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type HourlySchedule = { kind: 'hourly'; minute: 0 | 15 | 30 | 45 }

export type DailySchedule = { kind: 'daily'; time: string }

export type WeeklySchedule = {
  kind: 'weekly'
  day: Weekday
  time: string
}

export type CustomSchedule = { kind: 'custom'; expression: string }

export type Schedule =
  HourlySchedule | DailySchedule | WeeklySchedule | CustomSchedule

export type ScheduleTrigger = {
  id: string
  type: 'schedule'
  schedule: Schedule
}

export type EventTrigger = {
  id: string
  type: 'event'
  source: EventTriggerSource
}

export type AutomationTrigger = ScheduleTrigger | EventTrigger

export type ToolKind = 'memories' | 'tool' | 'mcp'

export type AutomationTool = {
  id: string
  name: string
  kind: ToolKind
}

export type AutomationDraft = {
  name: string
  active: boolean
  repositoryId: string | null
  instructions: string
  modelId: string
  triggers: AutomationTrigger[]
  tools: AutomationTool[]
}

export type RunRecord = {
  id: string
  at: string
  status: 'completed'
  source: 'manual'
}

interface AutomationBase {
  nextId: number
  draft: AutomationDraft
  runs: RunRecord[]
}

export type AutomationModel =
  | (AutomationBase & {
      type: 'Draft'
      saveError: null
      savedDraft: null
    })
  | (AutomationBase & {
      type: 'Saved'
      saveError: null
      savedDraft: AutomationDraft
    })
  | (AutomationBase & {
      type: 'Unsaved'
      saveError: null
      savedDraft: AutomationDraft
    })
  | (AutomationBase & {
      type: 'SaveError'
      saveError: string
      savedDraft: AutomationDraft | null
    })

export type AutomationAction =
  | { type: 'RENAME'; name: string }
  | { type: 'SET_ACTIVE'; active: boolean }
  | { type: 'SET_REPOSITORY'; repositoryId: string | null }
  | { type: 'SET_INSTRUCTIONS'; instructions: string }
  | { type: 'SET_MODEL'; modelId: string }
  | { type: 'ADD_SCHEDULE'; schedule: Schedule }
  | { type: 'UPDATE_SCHEDULE'; id: string; schedule: Schedule }
  | { type: 'ADD_EVENT_TRIGGER'; source: EventTriggerSource }
  | { type: 'REMOVE_TRIGGER'; id: string }
  | { type: 'ADD_TOOL'; catalogId: string }
  | { type: 'REMOVE_TOOL'; id: string }
  | { type: 'SAVE' }
  | { type: 'RUN_NOW'; at: string }

export function isScheduleTrigger(
  trigger: AutomationTrigger,
): trigger is ScheduleTrigger {
  return trigger.type === 'schedule'
}
