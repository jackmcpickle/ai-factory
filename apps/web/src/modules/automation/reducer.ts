import {
  DEFAULT_AUTOMATION_NAME,
  DEFAULT_MODEL_ID,
  MEMORIES_TOOL,
  TOOL_CATALOG,
} from "@/modules/automation/constants";
import { parseAutomationDraft } from "@/modules/automation/schemas/automation.schema";
import type {
  AutomationAction,
  AutomationDraft,
  AutomationModel,
  AutomationTrigger,
  RunRecord,
} from "@/modules/automation/types";

export function createAutomationModel(): AutomationModel {
  return {
    type: "Draft",
    nextId: 1,
    saveError: null,
    savedDraft: null,
    runs: [],
    draft: {
      name: DEFAULT_AUTOMATION_NAME,
      active: false,
      repositoryId: null,
      instructions: "",
      modelId: DEFAULT_MODEL_ID,
      triggers: [],
      tools: [MEMORIES_TOOL],
    },
  };
}

function savedDraftOf(model: AutomationModel): AutomationDraft | null {
  if (model.type === "Draft") {
    return null;
  }
  return model.savedDraft;
}

function withDraft(
  model: AutomationModel,
  draft: AutomationDraft,
  nextId = model.nextId
): AutomationModel {
  const savedDraft = savedDraftOf(model);
  if (savedDraft) {
    return {
      type: "Unsaved",
      nextId,
      draft,
      runs: model.runs,
      saveError: null,
      savedDraft,
    };
  }
  return {
    type: "Draft",
    nextId,
    draft,
    runs: model.runs,
    saveError: null,
    savedDraft: null,
  };
}

function withRuns(
  model: AutomationModel,
  runs: RunRecord[],
  nextId: number
): AutomationModel {
  switch (model.type) {
    case "Draft": {
      return { ...model, runs, nextId };
    }
    case "Saved": {
      return { ...model, runs, nextId };
    }
    case "Unsaved": {
      return { ...model, runs, nextId };
    }
    case "SaveError": {
      return { ...model, runs, nextId };
    }
    default: {
      const exhaustive: never = model;
      return exhaustive;
    }
  }
}

function replaceTrigger(
  triggers: AutomationTrigger[],
  id: string,
  schedule: Extract<AutomationTrigger, { type: "schedule" }>["schedule"]
): AutomationTrigger[] | null {
  const index = triggers.findIndex((trigger) => trigger.id === id);
  if (index === -1) {
    return null;
  }
  const current = triggers[index];
  if (current.type !== "schedule") {
    return null;
  }
  const next = [...triggers];
  next[index] = { id, type: "schedule", schedule };
  return next;
}

export function automationReducer(
  model: AutomationModel,
  action: AutomationAction
): AutomationModel {
  switch (action.type) {
    case "RENAME": {
      return withDraft(model, { ...model.draft, name: action.name });
    }
    case "SET_ACTIVE": {
      return withDraft(model, { ...model.draft, active: action.active });
    }
    case "SET_REPOSITORY": {
      return withDraft(model, {
        ...model.draft,
        repositoryId: action.repositoryId,
      });
    }
    case "SET_INSTRUCTIONS": {
      return withDraft(model, {
        ...model.draft,
        instructions: action.instructions,
      });
    }
    case "SET_MODEL": {
      return withDraft(model, { ...model.draft, modelId: action.modelId });
    }
    case "ADD_SCHEDULE": {
      const id = `trigger_${model.nextId}`;
      return withDraft(
        model,
        {
          ...model.draft,
          triggers: [
            ...model.draft.triggers,
            { id, type: "schedule", schedule: action.schedule },
          ],
        },
        model.nextId + 1
      );
    }
    case "UPDATE_SCHEDULE": {
      const triggers = replaceTrigger(
        model.draft.triggers,
        action.id,
        action.schedule
      );
      if (!triggers) {
        return model;
      }
      return withDraft(model, { ...model.draft, triggers });
    }
    case "ADD_EVENT_TRIGGER": {
      const exists = model.draft.triggers.some(
        (trigger) =>
          trigger.type === "event" && trigger.source === action.source
      );
      if (exists) {
        return model;
      }
      const id = `trigger_${model.nextId}`;
      return withDraft(
        model,
        {
          ...model.draft,
          triggers: [
            ...model.draft.triggers,
            { id, type: "event", source: action.source },
          ],
        },
        model.nextId + 1
      );
    }
    case "REMOVE_TRIGGER": {
      return withDraft(model, {
        ...model.draft,
        triggers: model.draft.triggers.filter(
          (trigger) => trigger.id !== action.id
        ),
      });
    }
    case "ADD_TOOL": {
      const catalog = TOOL_CATALOG.find((item) => item.id === action.catalogId);
      if (!catalog) {
        return model;
      }
      if (model.draft.tools.some((tool) => tool.id === catalog.id)) {
        return model;
      }
      return withDraft(model, {
        ...model.draft,
        tools: [...model.draft.tools, catalog],
      });
    }
    case "REMOVE_TOOL": {
      return withDraft(model, {
        ...model.draft,
        tools: model.draft.tools.filter((tool) => tool.id !== action.id),
      });
    }
    case "SAVE": {
      const parsed = parseAutomationDraft(model.draft);
      if (!parsed.ok) {
        return {
          type: "SaveError",
          nextId: model.nextId,
          draft: model.draft,
          runs: model.runs,
          saveError: parsed.error,
          savedDraft: savedDraftOf(model),
        };
      }
      return {
        type: "Saved",
        nextId: model.nextId,
        draft: parsed.draft,
        runs: model.runs,
        saveError: null,
        savedDraft: parsed.draft,
      };
    }
    case "RUN_NOW": {
      const run: RunRecord = {
        id: `run_${model.nextId}`,
        at: action.at,
        status: "completed",
        source: "manual",
      };
      return withRuns(model, [...model.runs, run], model.nextId + 1);
    }
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}
