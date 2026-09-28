import type { IssueView } from "#/data/types";

export type GroupBy = "status" | "priority" | "assignee" | "team" | "none";
export type OrderBy = "priority" | "title" | "cost";
export type LayoutMode = "list" | "board";

export interface IssueSearch {
  q: string;
  group: GroupBy;
  order: OrderBy;
  layout: LayoutMode;
  status: string;
  priority: string;
  assignee: string;
  team: string;
  label: string;
}

export const defaultIssueSearch: IssueSearch = {
  q: "",
  group: "status",
  order: "priority",
  layout: "list",
  status: "",
  priority: "",
  assignee: "",
  team: "",
  label: "",
};

const GROUPS: GroupBy[] = ["status", "priority", "assignee", "team", "none"];
const ORDERS: OrderBy[] = ["priority", "title", "cost"];

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
) {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

export function validateIssueSearch(
  search: Record<string, unknown>
): IssueSearch {
  return {
    q: typeof search.q === "string" ? search.q : "",
    group: pick(search.group, GROUPS, "status"),
    order: pick(search.order, ORDERS, "priority"),
    layout: search.layout === "board" ? "board" : "list",
    status: typeof search.status === "string" ? search.status : "",
    priority: typeof search.priority === "string" ? search.priority : "",
    assignee: typeof search.assignee === "string" ? search.assignee : "",
    team: typeof search.team === "string" ? search.team : "",
    label: typeof search.label === "string" ? search.label : "",
  };
}

export function issueSearch(partial: Partial<IssueSearch> = {}): IssueSearch {
  return { ...defaultIssueSearch, ...partial };
}

const FILTER_KEYS = [
  "status",
  "priority",
  "assignee",
  "team",
  "label",
] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export function sameFilters(a: IssueSearch, partial: Partial<IssueSearch>) {
  const b = issueSearch(partial);
  return FILTER_KEYS.every((key) => a[key] === b[key]);
}

export function toggleCsv(csv: string, value: string) {
  const set = new Set(csv ? csv.split(",").filter(Boolean) : []);
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  return [...set].join(",");
}

function matchesCsv(csv: string, value: string | null) {
  if (!csv) {
    return true;
  }
  if (!value) {
    return false;
  }
  return csv.split(",").includes(value);
}

export function applyIssueSearch(issues: IssueView[], search: IssueSearch) {
  const query = search.q.trim().toLowerCase();
  return issues.filter((issue) => {
    if (query) {
      const haystack =
        `${issue.id} ${issue.title} ${issue.description}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    if (!matchesCsv(search.status, issue.status)) {
      return false;
    }
    if (!matchesCsv(search.priority, issue.priority)) {
      return false;
    }
    if (!matchesCsv(search.assignee, issue.assigneeId)) {
      return false;
    }
    if (!matchesCsv(search.team, issue.teamId)) {
      return false;
    }
    if (search.label) {
      const wanted = search.label.split(",");
      if (!wanted.some((id) => issue.labelIds.includes(id))) {
        return false;
      }
    }
    return true;
  });
}

export interface SavedView {
  id: string;
  name: string;
  description: string;
  search: Partial<IssueSearch>;
}

export const SAVED_VIEWS: SavedView[] = [
  {
    id: "all",
    name: "All signals",
    description: "Every signal in the meal-choice dry run",
    search: {},
  },
  {
    id: "mine",
    name: "My issues",
    description: "Assigned to the synthetic PM",
    search: { assignee: "user-pm" },
  },
  {
    id: "review-ready",
    name: "Review ready",
    description: "Bounded candidates waiting on a person",
    search: { label: "review-ready" },
  },
  {
    id: "human-only",
    name: "Human only",
    description: "Dietary, allergen, and catering commitment",
    search: { label: "human-only" },
  },
  {
    id: "needs-info",
    name: "Needs information",
    description: "Not reproducible, or confidence is too low",
    search: { label: "needs-info" },
  },
  {
    id: "active",
    name: "Active",
    description: "Todo, in progress, and in review",
    search: { status: "todo,in_progress,in_review" },
  },
];

export function resolveView(search: IssueSearch) {
  return SAVED_VIEWS.find((view) => sameFilters(search, view.search));
}

export const defaultTrigger = {
  type: "schedule" as const,
  expression: "daily-review",
};

export const webhookTrigger = {
  type: "webhook" as const,
  eventType: "synthetic.feedback.received",
};

export function factoryQueryKey(policy: unknown, trigger: unknown) {
  return ["factory", policy ?? "file", trigger] as const;
}
