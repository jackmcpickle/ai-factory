import type { AppPart } from '@/lib/app-part'

export const RULE_MODE = {
  hold: 'hold',
  absent: 'absent',
} as const

export type RuleMode = (typeof RULE_MODE)[keyof typeof RULE_MODE]

export type RuleDraft = {
  name: string
  check: string
  mode: RuleMode
  target: AppPart
  featureName: string
}

export type AppRule = RuleDraft & {
  id: string
}

export type PullRequestResult = {
  id: string
  at: string
  ruleId: string
  ruleName: string
  targetLabel: string
  mode: RuleMode
  check: string
  headline: string
  body: string
}

interface RulesBase {
  nextId: number
  rules: AppRule[]
  results: PullRequestResult[]
}

export type RulesModel =
  | (RulesBase & { type: 'Ready'; error: null })
  | (RulesBase & { type: 'Invalid'; error: string })

export type RulesAction =
  | { type: 'ADD_RULE'; draft: RuleDraft }
  | { type: 'REMOVE_RULE'; id: string }
  | { type: 'RUN_RULE'; id: string; at: string }
