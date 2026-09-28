import { describe, expect, it } from 'vitest'
import { buildPullRequestResult } from '@/modules/rules/helpers'
import { createRulesModel, rulesReducer } from '@/modules/rules/reducer'
import type { RuleDraft } from '@/modules/rules/types'

const AT = '2026-09-28T13:00:00.000Z'

function draft(overrides: Partial<RuleDraft> = {}): RuleDraft {
  return {
    name: 'limit-discounts',
    check: 'Discounts stay at or below the stated cap.',
    mode: 'hold',
    target: 'backend',
    featureName: '',
    ...overrides,
  }
}

describe('rules', () => {
  it('lists a rule and runs a mock pull-request result for its target', () => {
    const added = rulesReducer(createRulesModel(), {
      type: 'ADD_RULE',
      draft: draft({ target: 'feature', featureName: 'Checkout' }),
    })
    const rule = added.rules[0]
    expect(rule.name).toBe('limit-discounts')
    const result = buildPullRequestResult({ id: 'pr_1', at: AT, rule })
    expect(result.body).toContain('all pull requests')
    expect(result.body).toContain('Checkout')
    expect(result.body).toContain(rule.check)
    const ran = rulesReducer(added, { type: 'RUN_RULE', id: rule.id, at: AT })
    expect(ran.results[0]?.ruleName).toBe('limit-discounts')
    expect(ran.results[0]?.targetLabel).toBe('Checkout')
  })

  it('rejects a rule with no check and ignores an unknown run', () => {
    const invalid = rulesReducer(createRulesModel(), {
      type: 'ADD_RULE',
      draft: draft({ check: ' ' }),
    })
    expect(invalid.type).toBe('Invalid')
    expect(invalid.rules).toEqual([])
    const ran = rulesReducer(createRulesModel(), {
      type: 'RUN_RULE',
      id: 'missing',
      at: AT,
    })
    expect(ran.results).toEqual([])
  })

  it('removes a rule from the list', () => {
    const added = rulesReducer(createRulesModel(), {
      type: 'ADD_RULE',
      draft: draft(),
    })
    const id = added.rules[0]?.id
    if (!id) throw new Error('missing rule')
    const removed = rulesReducer(added, { type: 'REMOVE_RULE', id })
    expect(removed.rules).toEqual([])
  })
})
