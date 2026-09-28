import {
  INTEGRATION_CATALOG,
  INTEGRATION_KINDS,
} from '@/modules/integrations/constants'
import type { IntegrationKind } from '@/modules/integrations/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isIntegrationKind(value: string): value is IntegrationKind {
  return INTEGRATION_KINDS.some((kind) => kind === value)
}

export function catalogEntry(kind: IntegrationKind) {
  const match = INTEGRATION_CATALOG.find((item) => item.kind === kind)
  if (!match) throw new Error(`Unknown integration ${kind}`)
  return match
}

export function normalizeIntegrationValue(
  kind: IntegrationKind,
  value: string,
): string {
  const trimmed = value.trim()
  if (kind === 'email') return trimmed.toLowerCase()
  return trimmed
}

export function integrationValueError(
  kind: IntegrationKind,
  value: string,
): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 'Enter a connection value'
  if (kind === 'email' && !EMAIL_PATTERN.test(trimmed)) {
    return 'Enter an email address'
  }
  if (kind === 'webhook' && !isHttpUrl(trimmed)) return 'Enter a webhook URL'
  return null
}
