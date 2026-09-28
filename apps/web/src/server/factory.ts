import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServerFn } from '@tanstack/react-start'
import { dispatch } from '../../../../packages/contracts/src.js'
import {
  orchestrate,
  safetyGate,
} from '../../../../apps/orchestrator/src/engine.js'
import type { FactoryResult, Policy, Trigger } from '#/data/types'

const repoRoot = path.resolve(
  fileURLToPath(new URL('../../../../', import.meta.url)),
)

async function readJson<T>(relative: string): Promise<T> {
  const file = await readFile(path.join(repoRoot, relative), 'utf8')
  return JSON.parse(file) as T
}

export type FactoryInput = {
  policy?: Policy | null
  trigger?: Trigger | null
}

const authority = {
  flightId: 'SYNTH-001',
  passengerToken: 'synthetic-token',
  mealId: 'M1',
  catalogueVersion: 'v1',
  dietaryAttributes: ['none'],
  inventoryAvailable: true,
  beforeCutoff: true,
  bookingActive: true,
  idempotencyKey: 'fake-1',
}

const candidate = {
  flightId: 'SYNTH-001',
  mealId: 'M1',
  dietaryAttributes: ['none'],
}

export const runFactory = createServerFn({ method: 'POST' })
  .validator((input: FactoryInput) => input)
  .handler(async ({ data }): Promise<FactoryResult> => {
    const [signals, workspace, filePolicy, roles] = await Promise.all([
      readJson<FactoryResult['signals']>('fixtures/signals.json'),
      readJson<FactoryResult['workspace']>('fixtures/workspace.json'),
      readJson<Policy>('policy.json'),
      readJson<FactoryResult['roles']>('agents/roles.json'),
    ])
    const policy = data.policy ?? filePolicy
    const trigger: Trigger = data.trigger ?? {
      type: 'schedule',
      expression: 'daily-review',
    }
    const run = orchestrate(
      signals,
      policy,
      workspace,
      trigger as { type: 'schedule'; expression: string },
      'meal-choice-demo',
    )
    const sandboxDispatch = dispatch({
      workspace,
      projectId: 'separate-sandbox',
      trigger,
      signalIds: [],
    }) as FactoryResult['sandboxDispatch']
    return {
      filePolicy,
      policy,
      trigger,
      run,
      sandboxDispatch,
      safety: {
        review: safetyGate(candidate, authority, policy),
        dietaryMismatch: safetyGate(
          candidate,
          { ...authority, dietaryAttributes: ['nut-free'] },
          policy,
        ),
        replay: safetyGate(
          candidate,
          { ...authority, duplicateIdempotencyKey: true },
          policy,
        ),
        missingKey: safetyGate(
          candidate,
          { ...authority, idempotencyKey: null },
          policy,
        ),
      },
      workspace,
      roles,
      signals,
    }
  })
