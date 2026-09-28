import { createFileRoute } from "@tanstack/react-router";

import { SkillLibraryView } from "@/modules/skill-library";

export const Route = createFileRoute("/automation/skills")({
  head: () => ({ meta: [{ title: "Skill library · Qantas AI" }] }),
  component: SkillLibraryView,
});
