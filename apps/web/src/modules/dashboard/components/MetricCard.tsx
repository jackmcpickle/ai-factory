import type { ReactElement } from "react";

import type { DeliveryMetric } from "@/modules/dashboard/types";

export function MetricCard({
  metric,
}: {
  metric: DeliveryMetric;
}): ReactElement {
  return (
    <article className="rounded-md border px-3 py-3">
      <h3 className="text-muted-foreground text-[12px]">{metric.label}</h3>
      <p className="mt-1 text-lg font-medium tabular-nums">{metric.value}</p>
      <p className="text-muted-foreground mt-1 text-[12px]">{metric.detail}</p>
    </article>
  );
}
