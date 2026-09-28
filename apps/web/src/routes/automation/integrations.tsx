import { createFileRoute } from "@tanstack/react-router";

import { IntegrationsView } from "@/modules/integrations";

export const Route = createFileRoute("/automation/integrations")({
  head: () => ({ meta: [{ title: "Integrations · Qantas AI" }] }),
  component: IntegrationsView,
});
