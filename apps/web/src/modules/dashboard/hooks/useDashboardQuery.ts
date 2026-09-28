import { queryOptions, useQuery } from "@tanstack/react-query";

import { buildDashboardSnapshot } from "@/modules/dashboard/helpers";
import { dashboardSnapshotSchema } from "@/modules/dashboard/schemas/dashboard.schema";
import type { DashboardSnapshot } from "@/modules/dashboard/types";
import { dashboardKeys } from "@/utils/queryKeys";

interface UseDashboardQueryReturn {
  snapshot: DashboardSnapshot;
  isDashboardLoading: boolean;
  isDashboardError: boolean;
}

function readDashboardSnapshot(): DashboardSnapshot {
  return dashboardSnapshotSchema.parse(buildDashboardSnapshot());
}

const DASHBOARD_SNAPSHOT = readDashboardSnapshot();

const DASHBOARD_QUERY_OPTIONS = queryOptions({
  queryKey: dashboardKeys.snapshot(),
  queryFn: readDashboardSnapshot,
  initialData: DASHBOARD_SNAPSHOT,
  staleTime: Number.POSITIVE_INFINITY,
});

export function dashboardQueryOptions(): typeof DASHBOARD_QUERY_OPTIONS {
  return DASHBOARD_QUERY_OPTIONS;
}

export function useDashboardQuery(): UseDashboardQueryReturn {
  const { data, isPending, isError } = useQuery(dashboardQueryOptions());
  return {
    snapshot: data,
    isDashboardLoading: isPending,
    isDashboardError: isError,
  };
}
