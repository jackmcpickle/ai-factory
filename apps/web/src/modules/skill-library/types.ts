export interface SkillFile {
  name: string;
  contents: string;
}

export interface SkillDraft {
  name: string;
  description: string;
  skill: string;
  otherFiles: SkillFile[];
  zipFileName: string | null;
}

export type SkillRecord = SkillDraft & {
  id: string;
  loaded: boolean;
  shared: boolean;
};

export interface SkillLibraryModel {
  type: "Ready";
  nextId: number;
  skills: SkillRecord[];
  pendingZipFileName: string | null;
}

export type SkillLibraryAction =
  | { type: "RECORD_ZIP"; fileName: string }
  | { type: "CLEAR_ZIP" }
  | { type: "SUBMIT_SKILL"; draft: SkillDraft }
  | { type: "LOAD_SKILL"; id: string }
  | { type: "SHARE_SKILL"; id: string }
  | { type: "UPLOAD_ZIP"; id: string; fileName: string };
