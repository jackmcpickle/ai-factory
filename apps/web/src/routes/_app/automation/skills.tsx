import { createFileRoute, redirect } from "@tanstack/react-router";

import { FEATURE_PATH } from "@/lib/features";

export const Route = createFileRoute("/_app/automation/skills")({
  beforeLoad: () => {
    throw redirect({ to: FEATURE_PATH.skills });
  },
});
