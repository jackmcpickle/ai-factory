import { useRulesContext } from "@/modules/rules/hooks/useRules";
import type { AppRule, PullRequestResult } from "@/modules/rules/types";

interface UseRulesQueryReturn {
  rules: AppRule[];
  results: PullRequestResult[];
  error: string | null;
  isRulesLoading: boolean;
  isRulesError: boolean;
}

export function useRulesQuery(): UseRulesQueryReturn {
  const { model } = useRulesContext();
  return {
    rules: model.rules,
    results: model.results,
    error: model.error,
    isRulesLoading: false,
    isRulesError: model.type === "Invalid",
  };
}
