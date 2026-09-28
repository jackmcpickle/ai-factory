import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { AutomationProvider } from "@/modules/automation";
import { IntegrationsProvider } from "@/modules/integrations";
import { RulesProvider } from "@/modules/rules";
import { SkillLibraryProvider } from "@/modules/skill-library";
import { ValidatorProvider } from "@/modules/validator";

export const Route = createFileRoute("/automation")({
  component: AutomationLayout,
});

function AutomationLayout(): ReactElement {
  return (
    <AutomationProvider>
      <SkillLibraryProvider>
        <ValidatorProvider>
          <RulesProvider>
            <IntegrationsProvider>
              <Outlet />
            </IntegrationsProvider>
          </RulesProvider>
        </ValidatorProvider>
      </SkillLibraryProvider>
    </AutomationProvider>
  );
}
