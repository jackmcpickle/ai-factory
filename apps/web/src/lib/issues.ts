import type {
  Comment,
  FactoryResult,
  IssueOverride,
  IssueView,
  Priority,
  Status,
} from "#/data/types";
import { assigneeFor, teamIdFor } from "#/lib/catalog";

const STATUS_BY_OUTCOME: Record<string, Status> = {
  awaiting_human_review: "in_review",
  human_only: "todo",
  needs_info: "backlog",
  quality_failed: "in_progress",
};

const LABEL_BY_OUTCOME: Record<string, string> = {
  awaiting_human_review: "review-ready",
  human_only: "human-only",
  needs_info: "needs-info",
  quality_failed: "needs-info",
};

function priorityFor(outcomeStatus: string, kind: string): Priority {
  if (outcomeStatus === "human_only") {
    return "urgent";
  }
  if (kind === "performance" || outcomeStatus === "awaiting_human_review") {
    return "high";
  }
  if (outcomeStatus === "quality_failed") {
    return "high";
  }
  return "medium";
}

function describe(result: FactoryResult, signalId: string) {
  const signal = result.signals.find((item) => item.id === signalId);
  const outcome = result.run.outcomes.find((item) => item.id === signalId);
  if (!signal || !outcome) {
    return "";
  }
  return [
    `Synthetic ${signal.kind.replaceAll("-", " ")} on flight ${signal.flight}. Confidence ${signal.confidence}. Reproducible: ${signal.reproducible ? "yes" : "no"}.`,
    `Route ${outcome.route.replaceAll("_", " ")} because ${outcome.reason}. Dry-run status: ${outcome.status.replaceAll("_", " ")}.`,
    `Fixture baseline: choice-miss rate ${signal.baseline.choiceMissRatePct}% and p90 ${signal.baseline.p90Ms} ms. These are not Qantas measurements.`,
    `Illustrative cost ${outcome.estimatedUsd} USD at the policy rate. No model was called. Required human: ${outcome.requiredHuman}. Release approved: no. Customer commitment: no.`,
  ].join("\n\n");
}

export function issuesFromRun(
  result: FactoryResult,
  drafts: IssueView[],
  overrides: Record<string, IssueOverride>
): IssueView[] {
  const fromSignals = result.signals.map((signal): IssueView => {
    const outcome =
      result.run.outcomes.find((item) => item.id === signal.id) ?? null;
    const status = outcome
      ? (STATUS_BY_OUTCOME[outcome.status] ?? "backlog")
      : "backlog";
    const routeLabel = outcome ? LABEL_BY_OUTCOME[outcome.status] : null;
    const base: IssueView = {
      id: signal.id,
      title: signal.title,
      description: describe(result, signal.id),
      status,
      priority: priorityFor(outcome?.status ?? "", signal.kind),
      assigneeId: assigneeFor(signal.team),
      teamId: teamIdFor(signal.team),
      projectId: result.run.projectId,
      labelIds: [...signal.tags, ...(routeLabel ? [routeLabel] : [])],
      cost: outcome?.estimatedUsd ?? 0,
      draft: false,
      outcome,
      events: result.run.events.filter((event) => event.signal === signal.id),
      signal,
    };
    return { ...base, ...overrides[signal.id] };
  });
  const local = drafts.map((draft) => ({ ...draft, ...overrides[draft.id] }));
  return [...fromSignals, ...local];
}

export function commentsFor(comments: Comment[], issueId: string) {
  return comments
    .filter((comment) => comment.issueId === issueId)
    .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const EVENT_COPY: Record<string, string> = {
  collected: "Collected the signal and recorded the fixture baseline.",
  "journey-proposed":
    "Sketched exception states. A designer still owns the journey.",
  routed: "Routed the signal from policy.",
  "isolated-proposal":
    "Described a bounded proposal. No code ran in this dry run.",
  "quality-gate":
    "Checked the supplied evidence flags. This is not a CI result.",
  "cost-recorded":
    "Recorded an illustrative cost. It is not a measured vendor bill.",
  deduplicated: "Deduplicated a repeated fingerprint.",
};
