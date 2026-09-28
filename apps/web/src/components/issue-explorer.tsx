import { Link, useNavigate } from "@tanstack/react-router";
import {
  createColumnHelper,
  createExpandedRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  columnGroupingFeature,
  rowExpandingFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type {
  ExpandedState,
  GroupingState,
  SortingState,
} from "@tanstack/react-table";
import { cn } from "cn";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  ListFilter,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useFactory } from "#/components/factory";
import { PriorityIcon, StatusIcon } from "#/components/icons";
import { LabelPill, TeamMark, UserAvatar } from "#/components/people";
import { PageHeader } from "#/components/shell";
import { isTyping, useUi } from "#/components/ui-state";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import type { IssueView, Priority, Status } from "#/data/types";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  PRIORITY_RANK,
  STATUSES,
  STATUS_LABEL,
  STATUS_RANK,
  money,
  teamMeta,
} from "#/lib/catalog";
import {
  applyIssueSearch,
  issueSearch,
  resolveView,
  toggleCsv,
} from "#/lib/search";
import type { GroupBy, IssueSearch, OrderBy } from "#/lib/search";

const features = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  columnGroupingFeature,
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  groupedRowModel: createGroupedRowModel(),
});

const SECONDARY_SORT: Record<OrderBy, SortingState[number]> = {
  priority: { id: "priority", desc: false },
  title: { id: "title", desc: false },
  cost: { id: "cost", desc: true },
};

const helper = createColumnHelper<typeof features, IssueView>();

const columns = helper.columns([
  helper.accessor("status", {
    id: "status",
    sortFn: (a, b) =>
      STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
  }),
  helper.accessor("priority", {
    id: "priority",
    sortFn: (a, b) =>
      PRIORITY_RANK[a.original.priority] - PRIORITY_RANK[b.original.priority],
  }),
  helper.accessor("title", { id: "title" }),
  helper.accessor("cost", { id: "cost" }),
  helper.accessor("assigneeId", { id: "assignee" }),
  helper.accessor("teamId", { id: "team" }),
]);

export function IssueExplorer({
  title,
  issues,
  search,
  onSearchChange,
}: {
  title?: string;
  issues: IssueView[];
  search: IssueSearch;
  onSearchChange: (next: IssueSearch) => void;
}) {
  const factory = useFactory();
  const navigate = useNavigate();
  const { commandOpen, createOpen } = useUi();
  const filtered = useMemo(
    () => applyIssueSearch(issues, search),
    [issues, search]
  );
  const view = resolveView(search);
  const heading = title ?? view?.name ?? "Issues";
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [cursor, setCursor] = useState(0);

  const sorting = useMemo<SortingState>(() => {
    const secondary: SortingState = [{ ...SECONDARY_SORT[search.order] }];
    if (search.group === "none") {
      return secondary;
    }
    const groupSort = { id: search.group, desc: false };
    return [groupSort, ...secondary.filter((item) => item.id !== search.group)];
  }, [search.group, search.order]);

  const grouping = useMemo<GroupingState>(
    () => (search.group === "none" ? [] : [search.group]),
    [search.group]
  );

  const table = useTable({
    features,
    data: filtered,
    columns,
    getRowId: (row) => row.id,
    groupedColumnMode: false,
    autoResetExpanded: false,
    enableSortingRemoval: false,
    state: { sorting, grouping, expanded },
    onExpandedChange: setExpanded,
  });

  const visible = table.getRowModel().rows.filter((row) => !row.getIsGrouped());
  const selectedIndex =
    visible.length === 0
      ? -1
      : Math.min(Math.max(cursor, 0), visible.length - 1);
  const selectedId =
    selectedIndex >= 0 ? visible[selectedIndex]?.original.id : undefined;
  const ordered = leafIssues(table.getSortedRowModel().rows);

  // Move the cursor back to the top whenever the filtered set changes.
  const [cursorIssues, setCursorIssues] = useState(filtered);
  if (cursorIssues !== filtered) {
    setCursorIssues(filtered);
    setCursor(0);
  }

  useEffect(() => {
    if (visible.length === 0) {
      return;
    }
    const current = visible[Math.min(cursor, visible.length - 1)];
    document
      .querySelector(`[data-issue-id="${current.original.id}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor, visible]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (commandOpen || createOpen || isTyping(event.target)) {
        return;
      }
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((index) => {
          if (visible.length === 0) {
            return 0;
          }
          return Math.min(visible.length - 1, Math.max(0, index) + 1);
        });
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((index) => Math.max(0, index - 1));
      }
      if (event.key === "Enter" && selectedId) {
        event.preventDefault();
        void navigate({
          to: "/issues/$issueId",
          params: { issueId: selectedId },
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, createOpen, navigate, selectedId, visible.length]);

  let content: ReactNode;
  if (filtered.length === 0) {
    content = (
      <div className="text-muted-foreground grid h-full place-items-center">
        <div className="text-center">
          <p>No issues match these filters.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() =>
              onSearchChange(
                issueSearch({ group: search.group, layout: search.layout })
              )
            }
          >
            Clear filters
          </Button>
        </div>
      </div>
    );
  } else if (search.layout === "board") {
    content = <Board issues={ordered} selectedId={selectedId} />;
  } else {
    content = (
      <div>
        {table.getRowModel().rows.map((row) =>
          row.getIsGrouped() ? (
            <button
              key={row.id}
              type="button"
              className="bg-background/95 sticky top-0 z-10 flex h-9 w-full items-center gap-2 border-b px-3 text-left backdrop-blur"
              onClick={() => row.toggleExpanded()}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="text-muted-foreground size-3.5" />
              ) : (
                <ChevronRight className="text-muted-foreground size-3.5" />
              )}
              <GroupLabel
                group={search.group}
                value={String(row.groupingValue)}
              />
              <span className="text-muted-foreground text-[12px] tabular-nums">
                {row.subRows.length}
              </span>
            </button>
          ) : (
            <IssueRow
              key={row.id}
              issue={row.original}
              selected={
                selectedId !== undefined && row.original.id === selectedId
              }
              showStatus={search.group !== "status"}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={heading}
        count={filtered.length}
        actions={
          <>
            {factory.isFetching ? (
              <span className="text-muted-foreground px-2 text-[12px]">
                Updating
              </span>
            ) : null}
            <Input
              value={search.q}
              onChange={(event) =>
                onSearchChange({ ...search, q: event.target.value })
              }
              placeholder="Filter"
              aria-label="Filter issues"
              className="h-7 w-36 border-transparent bg-transparent shadow-none md:w-48"
            />
            <FilterMenu search={search} onSearchChange={onSearchChange} />
            <DisplayMenu search={search} onSearchChange={onSearchChange} />
          </>
        }
      />
      <FilterChips search={search} onSearchChange={onSearchChange} />
      <div className="min-h-0 flex-1 overflow-auto">{content}</div>
    </div>
  );
}

function leafIssues(
  rows: ReturnType<
    ReturnType<typeof useTable<typeof features, IssueView>>["getSortedRowModel"]
  >["rows"]
): IssueView[] {
  const ordered: IssueView[] = [];
  for (const row of rows) {
    if (row.getIsGrouped()) {
      ordered.push(...leafIssues(row.subRows));
    } else {
      ordered.push(row.original);
    }
  }
  return ordered;
}

function IssueRow({
  issue,
  selected,
  showStatus,
}: {
  issue: IssueView;
  selected: boolean;
  showStatus: boolean;
}) {
  const factory = useFactory();
  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: issue.id }}
      data-issue-id={issue.id}
      data-testid="issue-row"
      aria-current={selected ? "true" : undefined}
      className={cn(
        "border-border/70 flex h-9 items-center gap-2.5 border-b px-3 text-[13px]",
        selected ? "bg-row-active" : "hover:bg-row-hover"
      )}
    >
      {showStatus ? <StatusIcon status={issue.status} /> : null}
      <PriorityIcon priority={issue.priority} />
      <span className="text-muted-foreground hidden w-16 shrink-0 font-mono text-[12px] sm:block">
        {issue.id}
      </span>
      <span className="min-w-0 flex-1 truncate">{issue.title}</span>
      <span className="hidden shrink-0 items-center gap-1 xl:flex">
        {issue.labelIds.slice(0, 3).map((id) => (
          <LabelPill key={id} id={id} />
        ))}
      </span>
      <span className="text-muted-foreground hidden w-28 shrink-0 items-center gap-1.5 lg:flex">
        <TeamMark teamId={issue.teamId} />
        <span className="truncate">{teamMeta(issue.teamId).name}</span>
      </span>
      <span className="text-muted-foreground hidden w-16 shrink-0 text-right text-[12px] tabular-nums md:block">
        {issue.cost ? money(issue.cost) : ""}
      </span>
      <UserAvatar
        userId={issue.assigneeId}
        users={factory.result.workspace.users}
      />
    </Link>
  );
}

function Board({
  issues,
  selectedId,
}: {
  issues: IssueView[];
  selectedId?: string;
}) {
  const factory = useFactory();
  return (
    <div className="flex h-full gap-3 overflow-x-auto px-3 py-3">
      {STATUSES.map((status) => {
        const column = issues.filter((issue) => issue.status === status);
        return (
          <section key={status} className="flex w-72 shrink-0 flex-col">
            <header className="mb-2 flex items-center gap-2 px-1 text-[13px]">
              <StatusIcon status={status} />
              {STATUS_LABEL[status]}
              <span className="text-muted-foreground tabular-nums">
                {column.length}
              </span>
            </header>
            <div className="flex flex-col gap-2">
              {column.map((issue) => (
                <Link
                  key={issue.id}
                  to="/issues/$issueId"
                  params={{ issueId: issue.id }}
                  data-issue-id={issue.id}
                  className={cn(
                    "bg-card hover:bg-row-hover rounded-lg border p-3",
                    issue.id === selectedId && "ring-brand ring-1"
                  )}
                >
                  <div className="text-[13px] leading-5 font-medium">
                    {issue.title}
                  </div>
                  <div className="text-muted-foreground mt-3 flex items-center gap-2 text-[12px]">
                    <PriorityIcon priority={issue.priority} />
                    <span className="font-mono">{issue.id}</span>
                    <span className="ml-auto">
                      <UserAvatar
                        userId={issue.assigneeId}
                        users={factory.result.workspace.users}
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GroupLabel({ group, value }: { group: GroupBy; value: string }) {
  const factory = useFactory();
  if (group === "status") {
    const status = value as Status;
    return (
      <span className="flex items-center gap-2">
        <StatusIcon status={status} />
        {STATUS_LABEL[status]}
      </span>
    );
  }
  if (group === "priority") {
    const priority = value as Priority;
    return (
      <span className="flex items-center gap-2">
        <PriorityIcon priority={priority} />
        {PRIORITY_LABEL[priority]}
      </span>
    );
  }
  if (group === "team") {
    return (
      <span className="flex items-center gap-2">
        <TeamMark teamId={value} />
        {teamMeta(value).name}
      </span>
    );
  }
  const user = factory.result.workspace.users.find((item) => item.id === value);
  return <span>{user?.name ?? value}</span>;
}

function FilterMenu({
  search,
  onSearchChange,
}: {
  search: IssueSearch;
  onSearchChange: (next: IssueSearch) => void;
}) {
  const factory = useFactory();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Filter menu">
          <ListFilter />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <FilterSection title="Status">
          {STATUSES.map((status) => (
            <FilterCheck
              key={status}
              checked={search.status.split(",").includes(status)}
              onCheckedChange={() =>
                onSearchChange({
                  ...search,
                  status: toggleCsv(search.status, status),
                })
              }
              label={STATUS_LABEL[status]}
            />
          ))}
        </FilterSection>
        <FilterSection title="Priority">
          {PRIORITIES.map((priority) => (
            <FilterCheck
              key={priority}
              checked={search.priority.split(",").includes(priority)}
              onCheckedChange={() =>
                onSearchChange({
                  ...search,
                  priority: toggleCsv(search.priority, priority),
                })
              }
              label={PRIORITY_LABEL[priority]}
            />
          ))}
        </FilterSection>
        <FilterSection title="Team">
          {factory.result.workspace.teams.map((team) => (
            <FilterCheck
              key={team.id}
              checked={search.team.split(",").includes(team.id)}
              onCheckedChange={() =>
                onSearchChange({
                  ...search,
                  team: toggleCsv(search.team, team.id),
                })
              }
              label={teamMeta(team.id).name}
            />
          ))}
        </FilterSection>
      </PopoverContent>
    </Popover>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="text-muted-foreground px-1 py-1 text-[11px]">{title}</div>
      {children}
    </div>
  );
}

function FilterCheck({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  label: string;
}) {
  return (
    <label className="hover:bg-accent flex h-7 items-center gap-2 rounded px-1 text-[13px]">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}

function DisplayMenu({
  search,
  onSearchChange,
}: {
  search: IssueSearch;
  onSearchChange: (next: IssueSearch) => void;
}) {
  const groups: { id: GroupBy; label: string }[] = [
    { id: "status", label: "Status" },
    { id: "priority", label: "Priority" },
    { id: "assignee", label: "Assignee" },
    { id: "team", label: "Team" },
    { id: "none", label: "No grouping" },
  ];
  const orders: { id: OrderBy; label: string }[] = [
    { id: "priority", label: "Priority" },
    { id: "title", label: "Title" },
    { id: "cost", label: "Cost" },
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Display options">
          {search.layout === "board" ? <LayoutGrid /> : <List />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="text-muted-foreground px-1 py-1 text-[11px]">
          Layout
        </div>
        <div className="mb-2 flex gap-1">
          <Button
            size="sm"
            variant={search.layout === "list" ? "secondary" : "ghost"}
            onClick={() => onSearchChange({ ...search, layout: "list" })}
          >
            <List /> List
          </Button>
          <Button
            size="sm"
            variant={search.layout === "board" ? "secondary" : "ghost"}
            onClick={() => onSearchChange({ ...search, layout: "board" })}
          >
            <LayoutGrid /> Board
          </Button>
        </div>
        <div className="text-muted-foreground px-1 py-1 text-[11px]">
          Grouping
        </div>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className="hover:bg-accent flex h-7 w-full items-center rounded px-2 text-left text-[13px]"
            onClick={() => onSearchChange({ ...search, group: group.id })}
          >
            {group.label}
            {search.group === group.id ? (
              <span className="text-brand ml-auto">✓</span>
            ) : null}
          </button>
        ))}
        <div className="text-muted-foreground mt-2 px-1 py-1 text-[11px]">
          Ordering
        </div>
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            className="hover:bg-accent flex h-7 w-full items-center rounded px-2 text-left text-[13px]"
            onClick={() => onSearchChange({ ...search, order: order.id })}
          >
            {order.label}
            {search.order === order.id ? (
              <span className="text-brand ml-auto">✓</span>
            ) : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function FilterChips({
  search,
  onSearchChange,
}: {
  search: IssueSearch;
  onSearchChange: (next: IssueSearch) => void;
}) {
  const view = resolveView(search);
  const chips: { key: string; label: string; clear: Partial<IssueSearch> }[] =
    [];
  if (search.q) {
    chips.push({ key: "q", label: `“${search.q}”`, clear: { q: "" } });
  }
  if (!view && search.status) {
    chips.push({ key: "status", label: search.status, clear: { status: "" } });
  }
  if (!view && search.label) {
    chips.push({ key: "label", label: search.label, clear: { label: "" } });
  }
  if (!view && search.team) {
    chips.push({ key: "team", label: search.team, clear: { team: "" } });
  }
  if (!view && search.priority) {
    chips.push({
      key: "priority",
      label: search.priority,
      clear: { priority: "" },
    });
  }
  if (!view && search.assignee) {
    chips.push({ key: "assignee", label: "Assignee", clear: { assignee: "" } });
  }
  if (chips.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1 border-b px-3 py-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="bg-accent text-muted-foreground hover:text-foreground rounded-full px-2 py-0.5 text-[12px]"
          onClick={() => onSearchChange({ ...search, ...chip.clear })}
        >
          {chip.label} ×
        </button>
      ))}
    </div>
  );
}
