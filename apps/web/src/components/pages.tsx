import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { PageHeader } from '#/components/shell'
import { triggerLabel, useFactory, webhookTrigger } from '#/components/factory'
import { UserAvatar } from '#/components/people'
import { IssueExplorer } from '#/components/issue-explorer'
import { money, teamMeta } from '#/lib/catalog'
import { SAVED_VIEWS, defaultTrigger, issueSearch } from '#/lib/search'
import type { WorkspaceProject } from '#/data/types'

export function InboxPage() {
  const factory = useFactory()
  const items = factory.issues.filter((issue) => issue.outcome && !issue.draft)
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Inbox"
        count={items.filter((issue) => !factory.inboxRead[issue.id]).length}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => factory.markAllRead()}
          >
            Mark all read
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {items.map((issue) => {
          const unread = !factory.inboxRead[issue.id]
          return (
            <Link
              key={issue.id}
              to="/issues/$issueId"
              params={{ issueId: issue.id }}
              className="flex items-start gap-3 border-b px-4 py-3 hover:bg-row-hover"
              onClick={() => factory.markRead(issue.id)}
            >
              <UserAvatar
                userId={issue.assigneeId}
                users={factory.result.workspace.users}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {unread ? (
                    <span className="size-1.5 rounded-full bg-brand" />
                  ) : null}
                  <span className="truncate text-[13px] font-medium">
                    {issue.title}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {issue.id} · {issue.outcome?.reason} ·{' '}
                  {issue.outcome?.requiredHuman}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

type ProjectRow = {
  id: string
  name: string
  lead: string
  teams: string
  loops: number
  signals: number
}

const projectFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
const projectHelper = createColumnHelper<typeof projectFeatures, ProjectRow>()
const projectColumns = projectHelper.columns([
  projectHelper.accessor('name', { header: 'Name' }),
  projectHelper.accessor('lead', { header: 'Lead' }),
  projectHelper.accessor('signals', { header: 'Signals' }),
  projectHelper.accessor('loops', { header: 'Loops' }),
])

export function ProjectsPage() {
  const factory = useFactory()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ])
  const data = useMemo<ProjectRow[]>(
    () =>
      factory.result.workspace.projects.map((project) => ({
        id: project.id,
        name: projectName(project.id),
        lead: leadName(factory.result, project),
        teams: project.assignedTeams.map((id) => teamMeta(id).name).join(', '),
        loops: project.loops.length,
        signals:
          project.id === factory.result.run.projectId
            ? factory.result.run.summary.signals
            : 0,
      })),
    [factory.result],
  )
  const table = useTable({
    features: projectFeatures,
    data,
    columns: projectColumns,
    state: { sorting },
    onSortingChange: setSorting,
  })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Projects" count={data.length} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-[1fr_140px_80px_80px] border-b px-4 py-2 text-[12px] text-muted-foreground">
          {table.getHeaderGroups()[0]?.headers.map((header) => (
            <button
              key={header.id}
              type="button"
              className="text-left"
              onClick={header.column.getToggleSortingHandler()}
            >
              {String(header.column.columnDef.header)}
              {header.column.getIsSorted() === 'asc' ? ' ↑' : ''}
              {header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
            </button>
          ))}
        </div>
        {table.getRowModel().rows.map((row) => (
          <Link
            key={row.id}
            to="/projects/$projectId"
            params={{ projectId: row.original.id }}
            className="grid grid-cols-[1fr_140px_80px_80px] items-center border-b px-4 py-2 text-[13px] hover:bg-row-hover"
          >
            <span className="font-medium">{row.original.name}</span>
            <span className="text-muted-foreground">{row.original.lead}</span>
            <span className="tabular-nums">{row.original.signals}</span>
            <span className="tabular-nums">{row.original.loops}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ProjectPage({ projectId }: { projectId: string }) {
  const factory = useFactory()
  const project = factory.result.workspace.projects.find(
    (item) => item.id === projectId,
  )
  const [search, setSearch] = useState(issueSearch())
  if (!project) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground">
        Unknown project
      </div>
    )
  }
  const issues =
    project.id === factory.result.run.projectId
      ? factory.issues.filter((issue) => issue.projectId === project.id)
      : []
  const dispatches =
    project.id === 'separate-sandbox'
      ? factory.result.sandboxDispatch
      : factory.result.run.loopDispatches

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title={projectName(project.id)} />
      <Tabs defaultValue="overview" className="min-h-0 flex-1">
        <TabsList variant="line" className="mx-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="loops">Loops</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="overflow-auto px-6 py-4">
          <p className="max-w-xl text-[14px] leading-6 text-muted-foreground">
            {project.id === 'meal-choice-demo'
              ? 'Tenancy boundary for the meal preorder dry run. Users and teams live outside the project and are assigned in.'
              : 'A second synthetic project. The same webhook event type does not cross into this project’s loop.'}
          </p>
          <dl className="mt-4 grid max-w-lg grid-cols-[120px_1fr] gap-y-2 text-[13px]">
            <dt className="text-muted-foreground">Lead</dt>
            <dd>{leadName(factory.result, project)}</dd>
            <dt className="text-muted-foreground">Teams</dt>
            <dd>
              {project.assignedTeams.map((id) => teamMeta(id).name).join(', ')}
            </dd>
            <dt className="text-muted-foreground">Trigger</dt>
            <dd>{triggerLabel(factory.trigger)}</dd>
            <dt className="text-muted-foreground">Signals</dt>
            <dd>{issues.length}</dd>
          </dl>
        </TabsContent>
        <TabsContent value="signals" className="min-h-0">
          {issues.length === 0 ? (
            <p className="px-6 py-8 text-[13px] text-muted-foreground">
              This project has no signals in the dry run. Its loops stay
              isolated from meal-choice-demo.
            </p>
          ) : (
            <IssueExplorer
              issues={issues}
              search={search}
              onSearchChange={setSearch}
              title="Signals"
            />
          )}
        </TabsContent>
        <TabsContent value="loops" className="overflow-auto px-6 py-4">
          <ul className="flex flex-col gap-3">
            {project.loops.map((loop) => {
              const matched = dispatches.some((item) => item.loopId === loop.id)
              const role = Object.hasOwn(factory.result.roles, loop.agentRole)
                ? factory.result.roles[loop.agentRole]
                : undefined
              return (
                <li key={loop.id} className="rounded-md border px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{loop.id}</span>
                    <span className="text-[12px] text-muted-foreground">
                      {matched ? 'Matched this trigger' : 'Not matched'}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {loop.agentRole} · {loop.trigger.type}
                    {loop.trigger.type === 'schedule'
                      ? ` · ${loop.trigger.expression}`
                      : ` · ${loop.trigger.eventType}`}
                  </p>
                  {role ? (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      May {role.may}. Cannot {role.cannot}. Owner:{' '}
                      {role.humanOwner}.
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant={
                factory.trigger.type === 'schedule' ? 'secondary' : 'ghost'
              }
              onClick={() => factory.setTrigger(defaultTrigger)}
            >
              Daily review
            </Button>
            <Button
              size="sm"
              variant={
                factory.trigger.type === 'webhook' ? 'secondary' : 'ghost'
              }
              onClick={() => factory.setTrigger(webhookTrigger)}
            >
              Feedback webhook
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function TeamsPage() {
  const factory = useFactory()
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Teams" count={factory.result.workspace.teams.length} />
      <div className="min-h-0 flex-1 overflow-auto">
        {factory.result.workspace.teams.map((team) => {
          const open = factory.issues.filter(
            (issue) =>
              issue.teamId === team.id &&
              issue.status !== 'done' &&
              issue.status !== 'canceled',
          ).length
          return (
            <Link
              key={team.id}
              to="/teams/$teamId"
              params={{ teamId: team.id }}
              className="flex items-center gap-3 border-b px-4 py-3 hover:bg-row-hover"
            >
              <span
                className="size-4 rounded-[4px]"
                style={{ background: teamMeta(team.id).color }}
              />
              <span className="font-medium">{teamMeta(team.id).name}</span>
              <span className="text-muted-foreground">
                {teamMeta(team.id).key}
              </span>
              <span className="ml-auto flex items-center gap-2">
                {team.members.map((id) => (
                  <UserAvatar
                    key={id}
                    userId={id}
                    users={factory.result.workspace.users}
                  />
                ))}
                <span className="w-16 text-right text-[12px] text-muted-foreground tabular-nums">
                  {open} open
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function TeamPage({ teamId }: { teamId: string }) {
  const factory = useFactory()
  const team = factory.result.workspace.teams.find((item) => item.id === teamId)
  const [search, setSearch] = useState(issueSearch())
  if (!team) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground">
        Unknown team
      </div>
    )
  }
  const issues = factory.issues.filter((issue) => issue.teamId === team.id)
  return (
    <IssueExplorer
      title={teamMeta(team.id).name}
      issues={issues}
      search={search}
      onSearchChange={setSearch}
    />
  )
}

export function ViewsPage() {
  const factory = useFactory()
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Views" />
      <div className="min-h-0 flex-1 overflow-auto">
        {SAVED_VIEWS.map((view) => {
          const count = factory.issues.filter((issue) => {
            const probe = issueSearch(view.search)
            if (probe.assignee && issue.assigneeId !== probe.assignee)
              return false
            if (probe.label && !issue.labelIds.includes(probe.label))
              return false
            if (probe.status && !probe.status.split(',').includes(issue.status))
              return false
            return true
          }).length
          return (
            <Link
              key={view.id}
              to="/issues"
              search={issueSearch(view.search)}
              className="flex items-center gap-3 border-b px-4 py-3 hover:bg-row-hover"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium">{view.name}</div>
                <div className="text-[12px] text-muted-foreground">
                  {view.description}
                </div>
              </div>
              <span className="ml-auto text-[12px] text-muted-foreground tabular-nums">
                {count}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function PolicyPage() {
  const factory = useFactory()
  const { policy, run, filePolicy } = factory.result
  const [tag, setTag] = useState('')
  const sig = run.outcomes.find((item) => item.id === 'SIG-001')
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Policy"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => factory.resetPolicy()}
          >
            Reset to {filePolicy.version}
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Editing here calls the same orchestrator as{' '}
          <span className="font-mono">npm run demo</span>. The estimate is
          illustrative. Nothing is released.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {policy.humanOnlyTags.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full bg-accent px-2 py-1 text-[12px]"
              onClick={() =>
                factory.updatePolicy((current) => ({
                  ...current,
                  version:
                    current.version === 'demo-v1' ? 'demo-v2' : current.version,
                  humanOnlyTags: current.humanOnlyTags.filter(
                    (tagName) => tagName !== item,
                  ),
                }))
              }
            >
              {item} ×
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex max-w-sm gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const next = tag.trim()
            if (!next) return
            factory.updatePolicy((current) => ({
              ...current,
              version: 'demo-v2',
              humanOnlyTags: current.humanOnlyTags.includes(next)
                ? current.humanOnlyTags
                : [...current.humanOnlyTags, next],
            }))
            setTag('')
          }}
        >
          <Input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Add a human-only tag"
            aria-label="Human-only tag"
            className="h-8"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => factory.applyUiHumanOnly()}
          >
            Add ui
          </Button>
        </form>
        <dl className="mt-6 grid max-w-lg grid-cols-[180px_1fr] gap-y-2 text-[13px]">
          <dt className="text-muted-foreground">Version</dt>
          <dd>{policy.version}</dd>
          <dt className="text-muted-foreground">Run</dt>
          <dd className="font-mono text-[12px]">{run.runId}</dd>
          <dt className="text-muted-foreground">Review ready</dt>
          <dd>{run.summary.reviewReady}</dd>
          <dt className="text-muted-foreground">Human only</dt>
          <dd>{run.summary.humanOnly}</dd>
          <dt className="text-muted-foreground">Needs information</dt>
          <dd>{run.summary.needsInfo}</dd>
          <dt className="text-muted-foreground">Illustrative cost</dt>
          <dd>{money(run.summary.estimatedUsd)}</dd>
          <dt className="text-muted-foreground">SIG-001</dt>
          <dd>{sig?.status.replaceAll('_', ' ')}</dd>
          <dt className="text-muted-foreground">Release approved</dt>
          <dd>{run.summary.releaseApproved ? 'yes' : 'no'}</dd>
        </dl>
        <div className="mt-6 flex gap-2">
          <Button
            size="sm"
            variant={
              factory.trigger.type === 'schedule' ? 'secondary' : 'ghost'
            }
            onClick={() => factory.setTrigger(defaultTrigger)}
          >
            Daily review
          </Button>
          <Button
            size="sm"
            variant={factory.trigger.type === 'webhook' ? 'secondary' : 'ghost'}
            onClick={() => factory.setTrigger(webhookTrigger)}
          >
            Feedback webhook
          </Button>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Active trigger: {triggerLabel(factory.trigger)}. Loops matched:{' '}
          {run.loopDispatches.map((item) => item.loopId).join(', ') || 'none'}.
          Sandbox:{' '}
          {factory.result.sandboxDispatch
            .map((item) => item.loopId)
            .join(', ') || 'none'}
          .
        </p>
      </div>
    </div>
  )
}

function projectName(id: string) {
  if (id === 'meal-choice-demo') return 'Meal choice demo'
  if (id === 'separate-sandbox') return 'Separate sandbox'
  return id
}

function leadName(
  result: { workspace: { users: { id: string; name: string }[] } },
  project: WorkspaceProject,
) {
  const lead = project.assignedUsers[0]
  return (
    result.workspace.users.find((user) => user.id === lead)?.name ??
    'Unassigned'
  )
}
