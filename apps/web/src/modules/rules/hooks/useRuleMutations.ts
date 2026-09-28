import { useMutation } from "@tanstack/react-query";
import type {
  UseMutateAsyncFunction,
  UseMutateFunction,
} from "@tanstack/react-query";

import { useRulesActions } from "@/modules/rules/hooks/useRules";
import { parseRuleDraft } from "@/modules/rules/schemas/rule.schema";
import type { RuleDraft } from "@/modules/rules/types";
import { ruleKeys } from "@/utils/queryKeys";

interface UseAddRuleMutationReturn {
  addRuleMutationAsync: UseMutateAsyncFunction<RuleDraft, Error, RuleDraft>;
  isAddPending: boolean;
}

export function useAddRuleMutation(): UseAddRuleMutationReturn {
  const actions = useRulesActions();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: [...ruleKeys.all, "add"],
    mutationFn: (draft: RuleDraft) => {
      const parsed = parseRuleDraft(draft);
      if (!parsed.ok) {
        return Promise.reject(new Error(parsed.error));
      }
      actions.add(parsed.draft);
      return Promise.resolve(parsed.draft);
    },
  });
  return { addRuleMutationAsync: mutateAsync, isAddPending: isPending };
}

interface UseRunRuleMutationReturn {
  runRuleMutation: UseMutateFunction<void, Error, string>;
  isRunPending: boolean;
}

export function useRunRuleMutation(): UseRunRuleMutationReturn {
  const actions = useRulesActions();
  const { mutate, isPending } = useMutation({
    mutationKey: [...ruleKeys.all, "run"],
    mutationFn: (id: string) => {
      actions.run(id, new Date().toISOString());
      return Promise.resolve();
    },
  });
  return { runRuleMutation: mutate, isRunPending: isPending };
}
