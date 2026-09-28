import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { FactoryProvider, factoryOptions } from "#/components/factory";
import { AppShell } from "#/components/shell";
import { defaultTrigger } from "#/lib/search";
import { IntegrationsProvider } from "@/modules/integrations";
import { RulesProvider } from "@/modules/rules";
import { SkillLibraryProvider } from "@/modules/skill-library";
import { ValidatorProvider } from "@/modules/validator";

export const Route = createFileRoute("/_app")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(factoryOptions(null, defaultTrigger)),
  component: Layout,
});

function Layout(): ReactElement {
  return (
    <FactoryProvider>
      <SkillLibraryProvider>
        <ValidatorProvider>
          <RulesProvider>
            <IntegrationsProvider>
              <AppShell>
                <Outlet />
              </AppShell>
            </IntegrationsProvider>
          </RulesProvider>
        </ValidatorProvider>
      </SkillLibraryProvider>
    </FactoryProvider>
  );
}
