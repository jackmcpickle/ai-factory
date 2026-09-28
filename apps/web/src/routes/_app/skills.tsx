import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { SkillLibraryView } from "@/modules/skill-library";

export const Route = createFileRoute("/_app/skills")({
  head: () => ({ meta: [{ title: "Skill library · Meal choice" }] }),
  component: SkillLibraryPage,
});

function SkillLibraryPage(): ReactElement {
  return <SkillLibraryView />;
}
