import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '#/components/pages'

export const Route = createFileRoute('/_app/projects/')({
  head: () => ({ meta: [{ title: 'Projects · Meal choice' }] }),
  component: ProjectsPage,
})
