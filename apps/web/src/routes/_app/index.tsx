import { createFileRoute } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { DashboardView } from '@/modules/dashboard'
import { dashboardQueryOptions } from '@/modules/dashboard/hooks/useDashboardQuery'

export const Route = createFileRoute('/_app/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions()),
  head: () => ({ meta: [{ title: 'Dashboard · Meal choice' }] }),
  component: DashboardPage,
})

function DashboardPage(): ReactElement {
  return <DashboardView />
}
