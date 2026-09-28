import { createFileRoute } from "@tanstack/react-router";

import { AutomationEditor } from "@/modules/automation";

export const Route = createFileRoute("/_app/automation/")({
  head: () => ({ meta: [{ title: "Automation · Qantas AI" }] }),
  component: AutomationEditor,
});
