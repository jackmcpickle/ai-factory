import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router";

import { useFactory } from "#/components/factory";
import { IssueExplorer } from "#/components/issue-explorer";
import { defaultIssueSearch, validateIssueSearch } from "#/lib/search";

export const Route = createFileRoute("/_app/issues/")({
  validateSearch: validateIssueSearch,
  search: {
    middlewares: [stripSearchParams(defaultIssueSearch)],
  },
  head: () => ({ meta: [{ title: "Signals · Meal choice" }] }),
  component: IssuesPage,
});

function IssuesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const factory = useFactory();
  return (
    <IssueExplorer
      issues={factory.issues}
      search={search}
      onSearchChange={(next) => {
        void navigate({ search: next });
      }}
    />
  );
}
