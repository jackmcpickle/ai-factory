import { createFileRoute, redirect } from '@tanstack/react-router'
import { issueSearch } from '#/lib/search'

export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: '/issues', search: issueSearch() })
  },
})
