import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { AutomationProvider } from "@/modules/automation";

export const Route = createFileRoute("/automation")({
  component: AutomationLayout,
});

function AutomationLayout(): ReactElement {
  return (
    <AutomationProvider>
      <Outlet />
    </AutomationProvider>
  );
}
