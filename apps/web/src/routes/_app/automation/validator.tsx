import { createFileRoute, redirect } from "@tanstack/react-router";

import { FEATURE_PATH } from "@/lib/features";

export const Route = createFileRoute("/_app/automation/validator")({
  beforeLoad: () => {
    throw redirect({ to: FEATURE_PATH.validator });
  },
});
