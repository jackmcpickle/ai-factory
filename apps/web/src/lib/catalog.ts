import type { Priority, Status } from '#/data/types'

export const CURRENT_USER_ID = 'user-pm'

export const STATUSES: Status[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'canceled',
]

export const STATUS_LABEL: Record<Status, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  canceled: 'Canceled',
}

export const STATUS_RANK: Record<Status, number> = {
  backlog: 0,
  todo: 1,
  in_progress: 2,
  in_review: 3,
  done: 4,
  canceled: 5,
}

export const PRIORITIES: Priority[] = [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
]

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
}

export const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

export const USER_META: Record<
  string,
  { initials: string; color: string; role: string }
> = {
  'user-pm': { initials: 'PM', color: '#5e6ad2', role: 'Product' },
  'user-engineer': { initials: 'EN', color: '#4cb782', role: 'Engineering' },
}

export const TEAM_META: Record<
  string,
  { name: string; key: string; color: string }
> = {
  'team-app': { name: 'App', key: 'APP', color: '#4cb782' },
  'team-platform': { name: 'Platform', key: 'PLT', color: '#26b5ce' },
  'team-safety': { name: 'Safety', key: 'SAFE', color: '#e5484d' },
}

export const LABEL_META: Record<string, { name: string; color: string }> = {
  'review-ready': { name: 'Review ready', color: '#4cb782' },
  'human-only': { name: 'Human only', color: '#e5484d' },
  'needs-info': { name: 'Needs info', color: '#f2c94c' },
  draft: { name: 'Draft', color: '#8a8f98' },
  ui: { name: 'ui', color: '#5e6ad2' },
  dietary: { name: 'dietary', color: '#e5484d' },
  allergen: { name: 'allergen', color: '#f2994a' },
  p90: { name: 'p90', color: '#f2c94c' },
  unknown: { name: 'unknown', color: '#8a8f98' },
  'catering-commitment': { name: 'catering-commitment', color: '#eb5757' },
}

export function teamIdFor(signalTeam: string) {
  return `team-${signalTeam}`
}

export function assigneeFor(signalTeam: string) {
  return signalTeam === 'safety' ? 'user-pm' : 'user-engineer'
}

export function labelMeta(id: string) {
  return LABEL_META[id] ?? { name: id, color: '#8a8f98' }
}

export function teamMeta(id: string) {
  return (
    TEAM_META[id] ?? {
      name: id.replace('team-', ''),
      key: 'TM',
      color: '#8a8f98',
    }
  )
}

export function userMeta(id: string) {
  return USER_META[id] ?? { initials: '?', color: '#8a8f98', role: 'Member' }
}

export function money(value: number) {
  return `$${value.toFixed(value < 0.01 ? 5 : 4)}`
}
