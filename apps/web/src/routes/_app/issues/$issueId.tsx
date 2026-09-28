import { Link, createFileRoute } from '@tanstack/react-router'
import { IssueDetail } from '#/components/issue-detail'
import { useFactory } from '#/components/factory'
import { issueSearch } from '#/lib/search'

export const Route = createFileRoute('/_app/issues/$issueId')({
  component: IssueRoute,
})

function IssueRoute() {
  const { issueId } = Route.useParams()
  const factory = useFactory()
  const issue = factory.issues.find((item) => item.id === issueId)
  if (!issue) {
    return (
      <div className="grid h-full place-items-center text-center">
        <div>
          <h1 className="text-base font-medium">Issue not found</h1>
          <Link
            to="/issues"
            search={issueSearch()}
            className="mt-2 inline-block text-brand"
          >
            Back to signals
          </Link>
        </div>
      </div>
    )
  }
  return <IssueDetail issue={issue} />
}
