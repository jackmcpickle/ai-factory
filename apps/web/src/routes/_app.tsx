import { Outlet, createFileRoute } from "@tanstack/react-router";

import { FactoryProvider, factoryOptions } from "#/components/factory";
import { AppShell } from "#/components/shell";
import { defaultTrigger } from "#/lib/search";

export const Route = createFileRoute("/_app")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(factoryOptions(null, defaultTrigger)),
  component: Layout,
});

function Layout() {
  return (
    <FactoryProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </FactoryProvider>
  );
}
