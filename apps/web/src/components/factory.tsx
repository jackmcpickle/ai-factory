import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type {
  Comment,
  FactoryResult,
  IssueOverride,
  IssueView,
  Policy,
  Priority,
  Status,
  Trigger,
} from "#/data/types";
import { CURRENT_USER_ID, assigneeFor } from "#/lib/catalog";
import { issuesFromRun } from "#/lib/issues";
import { defaultTrigger, factoryQueryKey } from "#/lib/search";
import { runFactory } from "#/server/factory";

export { webhookTrigger } from "#/lib/search";
export type { IssueSearch } from "#/lib/search";

interface DraftInput {
  title: string;
  description: string;
  teamId: string;
  priority: Priority;
  status: Status;
}

interface FactoryContextValue {
  result: FactoryResult;
  issues: IssueView[];
  comments: Comment[];
  isFetching: boolean;
  trigger: Trigger;
  setTrigger: (trigger: Trigger) => void;
  updatePolicy: (recipe: (policy: Policy) => Policy) => void;
  resetPolicy: () => void;
  applyUiHumanOnly: () => void;
  updateIssue: (id: string, patch: IssueOverride) => void;
  addComment: (issueId: string, body: string) => void;
  createDraft: (input: DraftInput) => IssueView;
  inboxRead: Record<string, boolean>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const FactoryContext = createContext<FactoryContextValue | null>(null);

export function factoryOptions(policy: Policy | null, trigger: Trigger) {
  return {
    queryKey: factoryQueryKey(policy, trigger),
    queryFn: () => runFactory({ data: { policy, trigger } }),
  };
}

export function FactoryProvider({ children }: { children: ReactNode }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [trigger, setTrigger] = useState<Trigger>(defaultTrigger);
  const [drafts, setDrafts] = useState<IssueView[]>([]);
  const [overrides, setOverrides] = useState<Record<string, IssueOverride>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [inboxRead, setInboxRead] = useState<Record<string, boolean>>({});
  const query = useQuery({
    ...factoryOptions(policy, trigger),
    staleTime: 30_000,
  });

  // Overrides belong to one factory run; drop them when the run inputs change.
  const key = JSON.stringify(factoryQueryKey(policy, trigger));
  const [overridesKey, setOverridesKey] = useState(key);
  if (overridesKey !== key) {
    setOverridesKey(key);
    setOverrides({});
  }

  const value = useMemo<FactoryContextValue | null>(() => {
    if (!query.data) {
      return null;
    }
    const result = query.data;
    return {
      result,
      issues: issuesFromRun(result, drafts, overrides),
      comments,
      isFetching: query.isFetching,
      trigger,
      setTrigger,
      updatePolicy: (recipe) => {
        const base = policy ?? result.policy;
        setPolicy(recipe(structuredClone(base)));
      },
      resetPolicy: () => setPolicy(null),
      applyUiHumanOnly: () => {
        const base = policy ?? result.filePolicy;
        const tags = base.humanOnlyTags.includes("ui")
          ? base.humanOnlyTags
          : [...base.humanOnlyTags, "ui"];
        setPolicy({ ...base, humanOnlyTags: tags, version: "demo-v2" });
      },
      updateIssue: (id, patch) => {
        setOverrides((current) => ({
          ...current,
          [id]: { ...current[id], ...patch },
        }));
      },
      addComment: (issueId, body) => {
        const trimmed = body.trim();
        if (!trimmed) {
          return;
        }
        setComments((current) => [
          ...current,
          {
            id: `comment-${current.length + 1}`,
            issueId,
            authorId: CURRENT_USER_ID,
            body: trimmed,
            createdAt: new Date().toISOString(),
          },
        ]);
      },
      createDraft: (input) => {
        const teamKey = input.teamId.replace("team-", "");
        const draft: IssueView = {
          id: `DRAFT-${drafts.length + 1}`,
          title: input.title.trim(),
          description:
            input.description.trim() ||
            "Local draft. This issue is not part of the orchestrator dry run.",
          status: input.status,
          priority: input.priority,
          assigneeId: assigneeFor(teamKey),
          teamId: input.teamId,
          projectId: "meal-choice-demo",
          labelIds: ["draft"],
          cost: 0,
          draft: true,
          outcome: null,
          events: [],
          signal: null,
        };
        setDrafts((current) => [...current, draft]);
        return draft;
      },
      inboxRead,
      markRead: (id) =>
        setInboxRead((current) =>
          current[id] ? current : { ...current, [id]: true }
        ),
      markAllRead: () => {
        const next: Record<string, boolean> = {};
        for (const issue of issuesFromRun(result, drafts, overrides)) {
          if (issue.outcome) {
            next[issue.id] = true;
          }
        }
        setInboxRead(next);
      },
    };
  }, [
    comments,
    drafts,
    inboxRead,
    overrides,
    policy,
    query.data,
    query.isFetching,
    trigger,
  ]);

  if (query.isError) {
    return (
      <div className="grid h-dvh place-items-center px-6 text-center">
        <div>
          <h1 className="text-base font-medium">The dry run did not load</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            {query.error instanceof Error
              ? query.error.message
              : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div className="text-muted-foreground grid h-dvh place-items-center">
        Loading workspace…
      </div>
    );
  }

  return (
    <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>
  );
}

export function useFactory() {
  const value = useContext(FactoryContext);
  if (!value) {
    throw new Error("Factory provider is missing");
  }
  return value;
}

export function triggerLabel(trigger: Trigger) {
  return trigger.type === "schedule" ? "Daily review" : "Feedback webhook";
}

export function isWebhook(trigger: Trigger) {
  return trigger.type === "webhook";
}
