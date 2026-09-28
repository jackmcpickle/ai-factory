import { buildPullRequestResult } from "@/modules/rules/helpers";
import { parseRuleDraft } from "@/modules/rules/schemas/rule.schema";
import type { AppRule, RulesAction, RulesModel } from "@/modules/rules/types";

export function createRulesModel(): RulesModel {
  return { type: "Ready", nextId: 1, rules: [], results: [], error: null };
}

export function rulesReducer(
  model: RulesModel,
  action: RulesAction
): RulesModel {
  switch (action.type) {
    case "ADD_RULE": {
      const parsed = parseRuleDraft(action.draft);
      if (!parsed.ok) {
        return { ...model, type: "Invalid", error: parsed.error };
      }
      const rule: AppRule = {
        id: `rule_${model.nextId}`,
        name: parsed.draft.name,
        check: parsed.draft.check,
        mode: parsed.draft.mode,
        target: parsed.draft.target,
        featureName: parsed.draft.featureName,
      };
      return {
        type: "Ready",
        nextId: model.nextId + 1,
        rules: [...model.rules, rule],
        results: model.results,
        error: null,
      };
    }
    case "REMOVE_RULE": {
      return {
        ...model,
        type: "Ready",
        error: null,
        rules: model.rules.filter((rule) => rule.id !== action.id),
      };
    }
    case "RUN_RULE": {
      const rule = model.rules.find((item) => item.id === action.id);
      if (!rule) {
        return model;
      }
      const result = buildPullRequestResult({
        id: `pr_${model.nextId}`,
        at: action.at,
        rule,
      });
      return {
        type: "Ready",
        nextId: model.nextId + 1,
        rules: model.rules,
        results: [result, ...model.results],
        error: null,
      };
    }
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}
