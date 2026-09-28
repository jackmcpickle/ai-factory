import { LayoutDashboard } from "lucide-react";
import type { ReactElement } from "react";

import { PageHeader } from "@/components/shell";
import { AgentUsageList } from "@/modules/dashboard/components/AgentUsageList";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { useDashboardQuery } from "@/modules/dashboard/hooks/useDashboardQuery";
import type { DashboardSnapshot } from "@/modules/dashboard/types";

export function DashboardView(): ReactElement {
  const { snapshot, isDashboardLoading, isDashboardError } =
    useDashboardQuery();
  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="dashboard">
      <PageHeader
        title="Dashboard"
        icon={<LayoutDashboard className="text-muted-foreground size-4" />}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-4">
          <DashboardBody
            snapshot={snapshot}
            isLoading={isDashboardLoading}
            isError={isDashboardError}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardBody({
  snapshot,
  isLoading,
  isError,
}: {
  snapshot: DashboardSnapshot;
  isLoading: boolean;
  isError: boolean;
}): ReactElement {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-[13px]">
        Loading sample metrics.
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-destructive text-[13px]" role="alert">
        Sample metrics are unavailable.
      </p>
    );
  }
  return (
    <>
      <p className="text-muted-foreground text-[13px]">
        Sample delivery figures · {snapshot.periodLabel}. These stay on this
        page.
      </p>
      <section aria-label="Delivery metrics">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {snapshot.metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>
      <AgentUsageList agents={snapshot.agents} />
    </>
  );
}
