import { createFileRoute } from '@tanstack/react-router'
import { PolicyPage } from '#/components/pages'

export const Route = createFileRoute('/_app/policy')({
  head: () => ({ meta: [{ title: 'Policy · Meal choice' }] }),
  component: PolicyPage,
})
