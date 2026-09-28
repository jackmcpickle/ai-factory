import { createFileRoute } from '@tanstack/react-router'
import { TeamPage } from '#/components/pages'

export const Route = createFileRoute('/_app/teams/$teamId')({
  component: TeamRoute,
})

function TeamRoute() {
  const { teamId } = Route.useParams()
  return <TeamPage teamId={teamId} />
}
