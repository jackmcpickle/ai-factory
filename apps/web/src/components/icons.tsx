import { cn } from 'cn'
import type { Priority, Status } from '#/data/types'

export function StatusIcon({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  const common = cn('size-4 shrink-0', className)
  if (status === 'backlog') {
    return (
      <svg className={common} viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="#8a8f98"
          strokeWidth="1.5"
          strokeDasharray="2.4 2.2"
        />
      </svg>
    )
  }
  if (status === 'todo') {
    return (
      <svg className={common} viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
  if (status === 'in_progress') {
    return (
      <svg className={common} viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="#f2c94c"
          strokeWidth="1.5"
        />
        <path d="M8 2.6a5.4 5.4 0 0 0 0 10.8z" fill="#f2c94c" />
      </svg>
    )
  }
  if (status === 'in_review') {
    return (
      <svg className={common} viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="#4cb782"
          strokeWidth="1.5"
        />
        <circle cx="8" cy="8" r="2.2" fill="#4cb782" />
      </svg>
    )
  }
  if (status === 'done') {
    return (
      <svg className={common} viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="7" fill="#5e6ad2" />
        <path
          d="M5 8.2 7 10.1 11.2 6"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg className={common} viewBox="0 0 16 16" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="#8a8f98"
        strokeWidth="1.5"
      />
      <path
        d="M5.6 5.6 10.4 10.4M10.4 5.6 5.6 10.4"
        stroke="#8a8f98"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority
  className?: string
}) {
  const active = { none: 0, low: 1, medium: 2, high: 3, urgent: 3 }[priority]
  const color =
    priority === 'urgent'
      ? '#e5484d'
      : priority === 'high'
        ? '#f2994a'
        : priority === 'medium'
          ? '#f2c94c'
          : '#9aa0a8'
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 16 16"
      aria-label={priority}
      role="img"
    >
      {[
        { x: 2.4, h: 4 },
        { x: 6.9, h: 7 },
        { x: 11.4, h: 10 },
      ].map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={13 - bar.h}
          width="2.2"
          height={bar.h}
          rx="0.6"
          fill={index < active ? color : 'currentColor'}
          opacity={index < active ? 1 : 0.28}
        />
      ))}
    </svg>
  )
}
