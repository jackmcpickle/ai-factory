import { createFileRoute } from '@tanstack/react-router'
import { InboxPage } from '#/components/pages'

export const Route = createFileRoute('/_app/inbox')({
  head: () => ({ meta: [{ title: 'Inbox · Meal choice' }] }),
  component: InboxPage,
})
