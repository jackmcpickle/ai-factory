import { describe, expect, it } from "vitest";

import { isCronExpression, scheduleLabel } from "@/modules/automation/helpers";
import {
  automationReducer,
  createAutomationModel,
} from "@/modules/automation/reducer";

const AT = "2026-09-28T13:00:00.000Z";

describe("cron expressions", () => {
  it("accepts a five-field expression", () => {
    expect(isCronExpression("0 * * * *")).toBeTruthy();
    expect(isCronExpression("*/15 9 * * 1-5")).toBeTruthy();
  });

  it("rejects empty, short, and prose input", () => {
    expect(isCronExpression("")).toBeFalsy();
    expect(isCronExpression("0 0 0")).toBeFalsy();
    expect(isCronExpression("not a cron")).toBeFalsy();
  });

  it("rejects out-of-range minute and hour fields", () => {
    expect(isCronExpression("99 99 99 99 99")).toBeFalsy();
    expect(isCronExpression("60 * * * *")).toBeFalsy();
    expect(isCronExpression("0 24 * * *")).toBeFalsy();
  });

  it("rejects out-of-range day, month, and weekday fields", () => {
    expect(isCronExpression("0 0 0 * *")).toBeFalsy();
    expect(isCronExpression("0 0 1 0 *")).toBeFalsy();
    expect(isCronExpression("0 0 1 1 8")).toBeFalsy();
  });

  it("rejects descending ranges and out-of-range list items", () => {
    expect(isCronExpression("10-2 * * * *")).toBeFalsy();
    expect(isCronExpression("0,99 * * * *")).toBeFalsy();
  });

  it("accepts boundary values and lists", () => {
    expect(isCronExpression("0 0 1 1 7")).toBeTruthy();
    expect(isCronExpression("0,15,30 0 1 1 0")).toBeTruthy();
  });
});

describe("schedule labels", () => {
  it("describes hourly, daily, weekly, and custom schedules", () => {
    expect(scheduleLabel({ kind: "hourly", minute: 15 })).toBe("Hourly at :15");
    expect(scheduleLabel({ kind: "daily", time: "09:00" })).toBe(
      "Daily at 09:00"
    );
    expect(
      scheduleLabel({ kind: "weekly", day: "monday", time: "09:00" })
    ).toBe("Weekly on Monday at 09:00");
    expect(scheduleLabel({ kind: "custom", expression: "0 9 * * 1" })).toBe(
      "Cron 0 9 * * 1"
    );
  });
});

describe("automation editor", () => {
  it("starts untitled, inactive, and with Memories", () => {
    const model = createAutomationModel();
    expect(model.type).toBe("Draft");
    expect(model.draft.name).toBe("Untitled");
    expect(model.draft.active).toBeFalsy();
    expect(model.draft.tools.map((tool) => tool.name)).toStrictEqual([
      "Memories",
    ]);
    expect(model.runs).toStrictEqual([]);
  });

  it("saves a draft and marks later edits unsaved", () => {
    const saved = automationReducer(createAutomationModel(), { type: "SAVE" });
    expect(saved.type).toBe("Saved");
    const unsaved = automationReducer(saved, {
      type: "RENAME",
      name: "Nightly",
    });
    expect(unsaved.type).toBe("Unsaved");
    expect(unsaved.draft.name).toBe("Nightly");
    const again = automationReducer(unsaved, { type: "SAVE" });
    expect(again.type).toBe("Saved");
    if (again.type !== "Saved") {
      return;
    }
    expect(again.savedDraft.name).toBe("Nightly");
  });

  it("rejects a blank name", () => {
    const renamed = automationReducer(createAutomationModel(), {
      type: "RENAME",
      name: "   ",
    });
    const failed = automationReducer(renamed, { type: "SAVE" });
    expect(failed.type).toBe("SaveError");
    if (failed.type !== "SaveError") {
      return;
    }
    expect(failed.saveError).toContain("Name is required");
  });

  it("adds, edits, and removes a schedule", () => {
    const added = automationReducer(createAutomationModel(), {
      type: "ADD_SCHEDULE",
      schedule: { kind: "hourly", minute: 0 },
    });
    const [trigger] = added.draft.triggers;
    expect(trigger.type).toBe("schedule");
    if (trigger.type !== "schedule") {
      return;
    }
    const edited = automationReducer(added, {
      type: "UPDATE_SCHEDULE",
      id: trigger.id,
      schedule: { kind: "hourly", minute: 30 },
    });
    const [updated] = edited.draft.triggers;
    expect(updated.type).toBe("schedule");
    if (updated.type !== "schedule") {
      return;
    }
    expect(updated.schedule).toStrictEqual({ kind: "hourly", minute: 30 });
    const removed = automationReducer(edited, {
      type: "REMOVE_TRIGGER",
      id: trigger.id,
    });
    expect(removed.draft.triggers).toStrictEqual([]);
  });

  it("rejects an empty custom cron on save", () => {
    const added = automationReducer(createAutomationModel(), {
      type: "ADD_SCHEDULE",
      schedule: { kind: "custom", expression: "" },
    });
    const failed = automationReducer(added, { type: "SAVE" });
    expect(failed.type).toBe("SaveError");
  });

  it("rejects an out-of-range custom cron on save", () => {
    const added = automationReducer(createAutomationModel(), {
      type: "ADD_SCHEDULE",
      schedule: { kind: "custom", expression: "99 99 99 99 99" },
    });
    const failed = automationReducer(added, { type: "SAVE" });
    expect(failed.type).toBe("SaveError");
  });

  it("keeps a single event trigger per source", () => {
    const once = automationReducer(createAutomationModel(), {
      type: "ADD_EVENT_TRIGGER",
      source: "github",
    });
    const twice = automationReducer(once, {
      type: "ADD_EVENT_TRIGGER",
      source: "github",
    });
    expect(twice.draft.triggers).toHaveLength(1);
    expect(twice.nextId).toBe(once.nextId);
  });

  it("adds and removes tools without duplicating them", () => {
    const added = automationReducer(createAutomationModel(), {
      type: "ADD_TOOL",
      catalogId: "slack",
    });
    const duplicate = automationReducer(added, {
      type: "ADD_TOOL",
      catalogId: "slack",
    });
    expect(duplicate.draft.tools.map((tool) => tool.id)).toStrictEqual([
      "memories",
      "slack",
    ]);
    const removed = automationReducer(duplicate, {
      type: "REMOVE_TOOL",
      id: "memories",
    });
    expect(removed.draft.tools.map((tool) => tool.id)).toStrictEqual(["slack"]);
  });

  it("records a manual run without changing the save state", () => {
    const saved = automationReducer(createAutomationModel(), { type: "SAVE" });
    const ran = automationReducer(saved, { type: "RUN_NOW", at: AT });
    expect(ran.type).toBe("Saved");
    expect(ran.runs).toStrictEqual([
      { id: "run_1", at: AT, status: "completed", source: "manual" },
    ]);
  });
});
