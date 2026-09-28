import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { IntegrationsView } from "@/modules/integrations";

export const Route = createFileRoute("/_app/integrations")({
  head: () => ({ meta: [{ title: "Integrations · Meal choice" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage(): ReactElement {
  return <IntegrationsView />;
}
