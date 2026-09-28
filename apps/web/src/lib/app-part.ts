export const APP_PARTS = ['backend', 'frontend', 'security', 'feature'] as const

export type AppPart = (typeof APP_PARTS)[number]

export const APP_PART_OPTIONS = [
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'security', label: 'Security' },
  { value: 'feature', label: 'Feature' },
] as const satisfies ReadonlyArray<{ value: AppPart; label: string }>

export function appPartLabel(part: AppPart, featureName: string): string {
  switch (part) {
    case 'backend':
      return 'Backend'
    case 'frontend':
      return 'Frontend'
    case 'security':
      return 'Security'
    case 'feature':
      return featureName.trim()
  }
}

export function requireFeatureName(
  part: AppPart,
  featureName: string,
): string | null {
  if (part === 'feature' && featureName.trim().length === 0) {
    return 'Feature name is required'
  }
  return null
}
