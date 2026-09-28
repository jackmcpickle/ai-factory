import { useMemo, useReducer, createContext, useContext } from "react";
import type { Dispatch, ReactElement, ReactNode } from "react";

import {
  automationReducer,
  createAutomationModel,
} from "@/modules/automation/reducer";
import type {
  AutomationAction,
  AutomationModel,
  EventTriggerSource,
  Schedule,
} from "@/modules/automation/types";

export interface AutomationActions {
  rename: (name: string) => void;
  setActive: (active: boolean) => void;
  setRepository: (repositoryId: string | null) => void;
  setInstructions: (instructions: string) => void;
  setModel: (modelId: string) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, schedule: Schedule) => void;
  addEventTrigger: (source: EventTriggerSource) => void;
  removeTrigger: (id: string) => void;
  addTool: (catalogId: string) => void;
  removeTool: (id: string) => void;
  save: () => void;
  runNow: (at: string) => void;
}

function bindAutomationActions(
  dispatch: Dispatch<AutomationAction>
): AutomationActions {
  return {
    rename(name) {
      dispatch({ type: "RENAME", name });
    },
    setActive(active) {
      dispatch({ type: "SET_ACTIVE", active });
    },
    setRepository(repositoryId) {
      dispatch({ type: "SET_REPOSITORY", repositoryId });
    },
    setInstructions(instructions) {
      dispatch({ type: "SET_INSTRUCTIONS", instructions });
    },
    setModel(modelId) {
      dispatch({ type: "SET_MODEL", modelId });
    },
    addSchedule(schedule) {
      dispatch({ type: "ADD_SCHEDULE", schedule });
    },
    updateSchedule(id, schedule) {
      dispatch({ type: "UPDATE_SCHEDULE", id, schedule });
    },
    addEventTrigger(source) {
      dispatch({ type: "ADD_EVENT_TRIGGER", source });
    },
    removeTrigger(id) {
      dispatch({ type: "REMOVE_TRIGGER", id });
    },
    addTool(catalogId) {
      dispatch({ type: "ADD_TOOL", catalogId });
    },
    removeTool(id) {
      dispatch({ type: "REMOVE_TOOL", id });
    },
    save() {
      dispatch({ type: "SAVE" });
    },
    runNow(at) {
      dispatch({ type: "RUN_NOW", at });
    },
  };
}

interface AutomationContextValue {
  model: AutomationModel;
  actions: AutomationActions;
}

const AutomationContext = createContext<AutomationContextValue | null>(null);

export function AutomationProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [model, dispatch] = useReducer(
    automationReducer,
    undefined,
    createAutomationModel
  );
  const actions = useMemo(() => bindAutomationActions(dispatch), []);
  const value = useMemo(() => ({ model, actions }), [model, actions]);
  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomationContext(): AutomationContextValue {
  const value = useContext(AutomationContext);
  if (!value) {
    throw new Error("Automation provider is missing");
  }
  return value;
}

export function useAutomationActions(): AutomationActions {
  return useAutomationContext().actions;
}
