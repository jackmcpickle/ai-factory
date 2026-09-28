import {
  DAILY_TIMES,
  EVENT_TRIGGER_OPTIONS,
  HOURLY_MINUTES,
  MODEL_OPTIONS,
  REPOSITORIES,
  WEEKDAYS,
} from "@/modules/automation/constants";
import type {
  AutomationTrigger,
  EventTriggerSource,
  HourlySchedule,
  Schedule,
  ScheduleKind,
  Weekday,
} from "@/modules/automation/types";

export { formatRunTimestamp } from "@/lib/time";

const CRON_BOUNDS = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 7 },
] as const;

function cronNumber(token: string): number | null {
  if (!/^[0-9]{1,2}$/u.test(token)) {
    return null;
  }
  return Number(token);
}

function inCronBounds(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function isCronToken(token: string, min: number, max: number): boolean {
  const pieces = token.split("/");
  if (pieces.length > 2) {
    return false;
  }
  const [base, stepToken] = pieces;
  if (base.length === 0) {
    return false;
  }
  if (pieces.length === 2) {
    if (!/^[1-9][0-9]*$/u.test(stepToken)) {
      return false;
    }
    if (Number(stepToken) > max) {
      return false;
    }
  }
  if (base === "*") {
    return true;
  }
  const range = base.split("-");
  if (range.length === 2) {
    const start = cronNumber(range[0]);
    const end = cronNumber(range[1]);
    if (start === null || end === null) {
      return false;
    }
    if (!inCronBounds(start, min, max) || !inCronBounds(end, min, max)) {
      return false;
    }
    return start <= end;
  }
  if (range.length !== 1) {
    return false;
  }
  const value = cronNumber(base);
  if (value === null) {
    return false;
  }
  return inCronBounds(value, min, max);
}

function isCronField(part: string, min: number, max: number): boolean {
  return part
    .split(",")
    .every((token) => token.length > 0 && isCronToken(token, min, max));
}

export function isCronExpression(value: string): boolean {
  const parts = value.trim().split(/\s+/u);
  if (parts.length !== 5) {
    return false;
  }
  return CRON_BOUNDS.every((bound, index) =>
    isCronField(parts[index], bound.min, bound.max)
  );
}

export function isHourlyMinute(
  value: number
): value is HourlySchedule["minute"] {
  return HOURLY_MINUTES.some((minute) => minute === value);
}

export function isDailyTime(
  value: string
): value is (typeof DAILY_TIMES)[number] {
  return DAILY_TIMES.some((time) => time === value);
}

export function isWeekday(value: string): value is Weekday {
  return WEEKDAYS.some((day) => day.id === value);
}

export function defaultSchedule(kind: ScheduleKind): Schedule {
  switch (kind) {
    case "hourly": {
      return { kind: "hourly", minute: 0 };
    }
    case "daily": {
      return { kind: "daily", time: "09:00" };
    }
    case "weekly": {
      return { kind: "weekly", day: "monday", time: "09:00" };
    }
    case "custom": {
      return { kind: "custom", expression: "" };
    }
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function weekdayLabel(day: Weekday): string {
  const match = WEEKDAYS.find((item) => item.id === day);
  return match ? match.label : day;
}

export function scheduleLabel(schedule: Schedule): string {
  switch (schedule.kind) {
    case "hourly": {
      return `Hourly at :${String(schedule.minute).padStart(2, "0")}`;
    }
    case "daily": {
      return `Daily at ${schedule.time}`;
    }
    case "weekly": {
      return `Weekly on ${weekdayLabel(schedule.day)} at ${schedule.time}`;
    }
    case "custom": {
      return schedule.expression.trim().length === 0
        ? "Custom cron"
        : `Cron ${schedule.expression.trim()}`;
    }
    default: {
      const exhaustive: never = schedule;
      return exhaustive;
    }
  }
}

export function eventTriggerLabel(source: EventTriggerSource): string {
  const match = EVENT_TRIGGER_OPTIONS.find((item) => item.source === source);
  return match ? match.label : source;
}

export function triggerLabel(trigger: AutomationTrigger): string {
  if (trigger.type === "event") {
    return eventTriggerLabel(trigger.source);
  }
  return scheduleLabel(trigger.schedule);
}

export function repositoryLabel(repositoryId: string | null): string {
  if (!repositoryId) {
    return "Select repository";
  }
  const match = REPOSITORIES.find((item) => item.id === repositoryId);
  return match ? match.label : "Select repository";
}

export function modelLabel(modelId: string): string {
  const match = MODEL_OPTIONS.find((item) => item.id === modelId);
  return match ? match.label : modelId;
}
