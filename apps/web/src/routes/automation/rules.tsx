import { createFileRoute } from "@tanstack/react-router";

import { RulesView } from "@/modules/rules";

export const Route = createFileRoute("/automation/rules")({
  head: () => ({ meta: [{ title: "Rules · Qantas AI" }] }),
  component: RulesView,
});
