export type Status =
  'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'canceled'

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export type Policy = {
  version: string
  maxRetries: number
  maxEstimatedUsdPerRun: number
  humanOnlyTags: string[]
  eligibleKinds: string[]
  releaseRequiresHuman: boolean
  minimumPassingChecks: number
  modelPricingUsdPerMillionTokens: { input: number; output: number }
}

export type Trigger =
  | { type: 'schedule'; expression: string }
  | { type: 'webhook'; eventType: string }

export type Signal = {
  id: string
  kind: string
  title: string
  team: string
  tags: string[]
  reproducible: boolean
  confidence: number
  flight: string
  synthetic: boolean
  baseline: { choiceMissRatePct: number; p90Ms: number }
  checks: Record<string, boolean>
  estimatedTokens: { input: number; output: number }
}

export type Outcome = {
  id: string
  team: string
  route: string
  status: string
  reason: string
  checks: { name: string; passed: boolean }[]
  estimatedUsd: number
  inputHash: string
  requiredHuman: string
  releaseApproved: boolean
  customerCommitment: boolean
}

export type TraceDetail = {
  fingerprint?: string
  baseline?: { choiceMissRatePct: number; p90Ms: number }
  synthetic?: boolean
  exceptions?: string[]
  humanOwner?: string
  route?: string
  reason?: string
  policyVersion?: string
  change?: string
  inputHash?: string
  retryCap?: number
  checks?: { name: string; passed: boolean }[]
  passing?: number
  required?: number
  finalStatus?: string
  estimatedUsd?: number
  notMeasured?: boolean
  model?: string
}

export type TraceEvent = {
  sequence: number
  signal: string
  team: string
  agent: string
  event: string
  detail: TraceDetail
}

export type LoopDispatch = {
  projectId: string
  loopId: string
  agentRole: string
  trigger: Trigger
  signalIds: string[]
  execution: string
  sideEffects: boolean
}

export type FactoryRun = {
  schemaVersion: string
  projectId: string
  tenancyBoundary: string
  loopDispatches: LoopDispatch[]
  policyVersion: string
  runId: string
  mode: string
  teams: Record<string, string[]>
  events: TraceEvent[]
  outcomes: Outcome[]
  summary: {
    signals: number
    reviewReady: number
    humanOnly: number
    needsInfo: number
    estimatedUsd: number
    releaseApproved: boolean
  }
}

export type SafetyDecision = {
  decision: string
  failures: string[]
  commitmentExecuted: boolean
  policyVersion: string
}

export type WorkspaceUser = { id: string; name: string }
export type WorkspaceTeam = { id: string; members: string[] }
export type WorkspaceLoop = {
  id: string
  agentRole: string
  trigger: Trigger
}
export type WorkspaceProject = {
  id: string
  synthetic: boolean
  assignedUsers: string[]
  assignedTeams: string[]
  loops: WorkspaceLoop[]
}

export type WorkspaceFile = {
  users: WorkspaceUser[]
  teams: WorkspaceTeam[]
  projects: WorkspaceProject[]
}

export type RoleFile = Record<
  string,
  { team: string; may: string; cannot: string; humanOwner: string }
>

export type FactoryResult = {
  filePolicy: Policy
  policy: Policy
  trigger: Trigger
  run: FactoryRun
  sandboxDispatch: LoopDispatch[]
  safety: {
    review: SafetyDecision
    dietaryMismatch: SafetyDecision
    replay: SafetyDecision
    missingKey: SafetyDecision
  }
  workspace: WorkspaceFile
  roles: RoleFile
  signals: Signal[]
}

export type IssueView = {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId: string
  teamId: string
  projectId: string
  labelIds: string[]
  cost: number
  draft: boolean
  outcome: Outcome | null
  events: TraceEvent[]
  signal: Signal | null
}

export type Comment = {
  id: string
  issueId: string
  authorId: string
  body: string
  createdAt: string
}

export type IssueOverride = {
  title?: string
  description?: string
  status?: Status
  priority?: Priority
  assigneeId?: string
}
