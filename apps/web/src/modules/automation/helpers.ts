import { formatRunTimestamp } from '@/lib/time'
import {
  DAILY_TIMES,
  EVENT_TRIGGER_OPTIONS,
  HOURLY_MINUTES,
  MODEL_OPTIONS,
  REPOSITORIES,
  WEEKDAYS,
} from '@/modules/automation/constants'
import type {
  AutomationTrigger,
  EventTriggerSource,
  HourlySchedule,
  Schedule,
  ScheduleKind,
  Weekday,
} from '@/modules/automation/types'

const CRON_PART =
  /^(\*|\*\/[1-9][0-9]*|[0-9]{1,2}(-[0-9]{1,2})?(\/[1-9][0-9]*)?)(,(\*|\*\/[1-9][0-9]*|[0-9]{1,2}(-[0-9]{1,2})?(\/[1-9][0-9]*)?))*$/

export function isCronExpression(value: string): boolean {
  const parts = value.trim().split(/\s+/)
  if (parts.length !== 5) return false
  return parts.every((part) => CRON_PART.test(part))
}

export function isHourlyMinute(
  value: number,
): value is HourlySchedule['minute'] {
  return HOURLY_MINUTES.some((minute) => minute === value)
}

export function isDailyTime(
  value: string,
): value is (typeof DAILY_TIMES)[number] {
  return DAILY_TIMES.some((time) => time === value)
}

export function isWeekday(value: string): value is Weekday {
  return WEEKDAYS.some((day) => day.id === value)
}

export function defaultSchedule(kind: ScheduleKind): Schedule {
  switch (kind) {
    case 'hourly':
      return { kind: 'hourly', minute: 0 }
    case 'daily':
      return { kind: 'daily', time: '09:00' }
    case 'weekly':
      return { kind: 'weekly', day: 'monday', time: '09:00' }
    case 'custom':
      return { kind: 'custom', expression: '' }
  }
}

export function weekdayLabel(day: Weekday): string {
  const match = WEEKDAYS.find((item) => item.id === day)
  return match ? match.label : day
}

export function scheduleLabel(schedule: Schedule): string {
  switch (schedule.kind) {
    case 'hourly':
      return `Hourly at :${String(schedule.minute).padStart(2, '0')}`
    case 'daily':
      return `Daily at ${schedule.time}`
    case 'weekly':
      return `Weekly on ${weekdayLabel(schedule.day)} at ${schedule.time}`
    case 'custom':
      return schedule.expression.trim().length === 0
        ? 'Custom cron'
        : `Cron ${schedule.expression.trim()}`
  }
}

export function eventTriggerLabel(source: EventTriggerSource): string {
  const match = EVENT_TRIGGER_OPTIONS.find((item) => item.source === source)
  return match ? match.label : source
}

export function triggerLabel(trigger: AutomationTrigger): string {
  if (trigger.type === 'event') return eventTriggerLabel(trigger.source)
  return scheduleLabel(trigger.schedule)
}

export function repositoryLabel(repositoryId: string | null): string {
  if (!repositoryId) return 'Select repository'
  const match = REPOSITORIES.find((item) => item.id === repositoryId)
  return match ? match.label : 'Select repository'
}

export function modelLabel(modelId: string): string {
  const match = MODEL_OPTIONS.find((item) => item.id === modelId)
  return match ? match.label : modelId
}

export { formatRunTimestamp }
