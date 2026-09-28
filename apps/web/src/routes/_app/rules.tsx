import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { RulesView } from "@/modules/rules";

export const Route = createFileRoute("/_app/rules")({
  head: () => ({ meta: [{ title: "Rules · Meal choice" }] }),
  component: RulesPage,
});

function RulesPage(): ReactElement {
  return <RulesView />;
}
