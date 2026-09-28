import { createFileRoute } from '@tanstack/react-router'
import { ViewsPage } from '#/components/pages'

export const Route = createFileRoute('/_app/views')({
  head: () => ({ meta: [{ title: 'Views · Meal choice' }] }),
  component: ViewsPage,
})
