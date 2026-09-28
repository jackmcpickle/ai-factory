import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { appPartLabel } from "@/lib/app-part";
import { formatRunTimestamp } from "@/lib/time";
import { ruleModeLabel } from "@/modules/rules/helpers";
import { useRunRuleMutation } from "@/modules/rules/hooks/useRuleMutations";
import { useRulesActions } from "@/modules/rules/hooks/useRules";
import { useRulesQuery } from "@/modules/rules/hooks/useRulesQuery";
import type { AppRule, PullRequestResult } from "@/modules/rules/types";

export function RuleList(): ReactElement {
  const { rules, results, error } = useRulesQuery();
  return (
    <div className="flex flex-col gap-6" data-testid="rule-list">
      <RuleError message={error} />
      <EmptyRules count={rules.length} />
      <ul className="flex flex-col gap-3">
        {rules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </ul>
      <ResultList results={results} />
    </div>
  );
}

function RuleError({
  message,
}: {
  message: string | null;
}): ReactElement | null {
  if (!message) {
    return null;
  }
  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

function EmptyRules({ count }: { count: number }): ReactElement | null {
  if (count > 0) {
    return null;
  }
  return (
    <p className="text-muted-foreground text-sm">
      No rules yet. Write one, then run it to record a mock pull-request check.
    </p>
  );
}

function RuleCard({ rule }: { rule: AppRule }): ReactElement {
  const actions = useRulesActions();
  const { runRuleMutation } = useRunRuleMutation();
  const target = appPartLabel(rule.target, rule.featureName);
  return (
    <li className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{rule.name}</h3>
          <p className="text-muted-foreground text-xs">
            {target} · {ruleModeLabel(rule.mode)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => runRuleMutation(rule.id)}
          >
            Run
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => actions.remove(rule.id)}
          >
            Remove
          </Button>
        </div>
      </div>
      <p className="text-sm">{rule.check}</p>
    </li>
  );
}

function ResultList({
  results,
}: {
  results: PullRequestResult[];
}): ReactElement | null {
  if (results.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-3" data-testid="pull-request-results">
      <h2 className="text-sm font-medium">Pull request results</h2>
      <ul className="flex flex-col gap-3">
        {results.map((result) => (
          <li key={result.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{result.headline}</h3>
              <span className="text-muted-foreground text-xs">
                {formatRunTimestamp(result.at)}
              </span>
            </div>
            <p className="mt-2 text-sm">{result.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
