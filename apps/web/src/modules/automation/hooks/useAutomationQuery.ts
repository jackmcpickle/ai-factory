import { useAutomationContext } from "@/modules/automation/hooks/useAutomationEditor";
import type {
  AutomationDraft,
  AutomationModel,
  RunRecord,
} from "@/modules/automation/types";

interface UseAutomationQueryReturn {
  automation: AutomationDraft;
  runs: RunRecord[];
  status: AutomationModel["type"];
  saveError: string | null;
  nextId: number;
  isAutomationLoading: boolean;
  isAutomationError: boolean;
}

export function useAutomationQuery(): UseAutomationQueryReturn {
  const { model } = useAutomationContext();
  return {
    automation: model.draft,
    runs: model.runs,
    status: model.type,
    saveError: model.saveError,
    nextId: model.nextId,
    isAutomationLoading: false,
    isAutomationError: model.type === "SaveError",
  };
}
