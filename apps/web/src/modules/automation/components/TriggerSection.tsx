import { ChevronDown, Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { SectionBlock } from '@/components/editor-frame'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DAILY_TIMES,
  EVENT_TRIGGER_OPTIONS,
  HOURLY_MINUTES,
  SCHEDULE_OPTIONS,
  WEEKDAYS,
} from '@/modules/automation/constants'
import {
  defaultSchedule,
  isDailyTime,
  isHourlyMinute,
  isWeekday,
  scheduleLabel,
  triggerLabel,
} from '@/modules/automation/helpers'
import { useAutomationActions } from '@/modules/automation/hooks/useAutomationEditor'
import { useAutomationQuery } from '@/modules/automation/hooks/useAutomationQuery'
import type {
  Schedule,
  ScheduleKind,
  ScheduleTrigger,
} from '@/modules/automation/types'
import { isScheduleTrigger } from '@/modules/automation/types'

export function TriggerSection(): ReactElement {
  const { automation, nextId } = useAutomationQuery()
  const actions = useAutomationActions()
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleAddSchedule(kind: ScheduleKind): void {
    const id = `trigger_${nextId}`
    actions.addSchedule(defaultSchedule(kind))
    setEditingId(id)
  }

  return (
    <SectionBlock title="Triggers">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus /> Add Trigger
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Scheduled</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {SCHEDULE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.kind}
                  onSelect={() => handleAddSchedule(option.kind)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {EVENT_TRIGGER_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.source}
              onSelect={() => actions.addEventTrigger(option.source)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ul className="flex flex-col gap-2" data-testid="trigger-list">
        {automation.triggers.map((trigger) => (
          <li
            key={trigger.id}
            className="rounded-md border px-3 py-2"
            data-testid={`trigger-${trigger.id}`}
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 text-sm">
                {triggerLabel(trigger)}
              </div>
              {isScheduleTrigger(trigger) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(trigger.id)}
                >
                  Edit
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${triggerLabel(trigger)}`}
                onClick={() => actions.removeTrigger(trigger.id)}
              >
                <X />
              </Button>
            </div>
            {isScheduleTrigger(trigger) && editingId === trigger.id ? (
              <ScheduleFields
                trigger={trigger}
                onChange={(schedule) =>
                  actions.updateSchedule(trigger.id, schedule)
                }
                onClose={() => setEditingId(null)}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </SectionBlock>
  )
}

function ScheduleFields({
  trigger,
  onChange,
  onClose,
}: {
  trigger: ScheduleTrigger
  onChange: (schedule: Schedule) => void
  onClose: () => void
}): ReactElement {
  const schedule = trigger.schedule
  return (
    <div className="mt-3 flex flex-col gap-2 border-t pt-3">
      <p className="text-xs text-muted-foreground">{scheduleLabel(schedule)}</p>
      {schedule.kind === 'hourly' ? (
        <label className="flex flex-col gap-1 text-xs">
          Minute
          <select
            aria-label="Hourly minute"
            value={schedule.minute}
            onChange={(event) => {
              const minute = Number(event.target.value)
              if (!isHourlyMinute(minute)) return
              onChange({ kind: 'hourly', minute })
            }}
            className="h-8 rounded-md border bg-transparent px-2 text-sm"
          >
            {HOURLY_MINUTES.map((minute) => (
              <option key={minute} value={minute}>
                :{String(minute).padStart(2, '0')}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {schedule.kind === 'daily' ? (
        <TimeSelect
          label="Time"
          value={schedule.time}
          onChange={(time) => onChange({ kind: 'daily', time })}
        />
      ) : null}
      {schedule.kind === 'weekly' ? (
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs">
            Day
            <select
              aria-label="Weekday"
              value={schedule.day}
              onChange={(event) => {
                if (!isWeekday(event.target.value)) return
                onChange({
                  kind: 'weekly',
                  day: event.target.value,
                  time: schedule.time,
                })
              }}
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              {WEEKDAYS.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <TimeSelect
            label="Time"
            value={schedule.time}
            onChange={(time) =>
              onChange({ kind: 'weekly', day: schedule.day, time })
            }
          />
        </div>
      ) : null}
      {schedule.kind === 'custom' ? (
        <label className="flex flex-col gap-1 text-xs">
          Cron expression
          <input
            aria-label="Cron expression"
            value={schedule.expression}
            placeholder="0 9 * * 1"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange({ kind: 'custom', expression: event.target.value })
            }
            className="h-8 rounded-md border bg-transparent px-2 text-sm"
          />
        </label>
      ) : null}
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <ChevronDown className="size-3.5" /> Done
        </Button>
      </div>
    </div>
  )
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (time: (typeof DAILY_TIMES)[number]) => void
}): ReactElement {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => {
          if (!isDailyTime(event.target.value)) return
          onChange(event.target.value)
        }}
        className="h-8 rounded-md border bg-transparent px-2 text-sm"
      >
        {DAILY_TIMES.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </label>
  )
}
