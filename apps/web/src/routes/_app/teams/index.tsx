import { createFileRoute } from "@tanstack/react-router";

import { TeamsPage } from "#/components/pages";

export const Route = createFileRoute("/_app/teams/")({
  head: () => ({ meta: [{ title: "Teams · Meal choice" }] }),
  component: TeamsPage,
});
