import { appPartLabel } from '@/lib/app-part'
import { RULE_MODE_OPTIONS } from '@/modules/rules/constants'
import type {
  AppRule,
  PullRequestResult,
  RuleMode,
} from '@/modules/rules/types'

export function ruleModeLabel(mode: RuleMode): string {
  const match = RULE_MODE_OPTIONS.find((item) => item.value === mode)
  return match ? match.label : mode
}

export function buildPullRequestResult(input: {
  id: string
  at: string
  rule: AppRule
}): PullRequestResult {
  const targetLabel = appPartLabel(input.rule.target, input.rule.featureName)
  const modeLabel = ruleModeLabel(input.rule.mode)
  return {
    id: input.id,
    at: input.at,
    ruleId: input.rule.id,
    ruleName: input.rule.name,
    targetLabel,
    mode: input.rule.mode,
    check: input.rule.check,
    headline: `Mock pull request · ${input.rule.name}`,
    body: `Rule "${input.rule.name}" would run on all pull requests for ${targetLabel}. ${modeLabel}: ${input.rule.check}`,
  }
}
