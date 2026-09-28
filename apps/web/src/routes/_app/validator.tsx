import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { ValidatorView } from "@/modules/validator";

export const Route = createFileRoute("/_app/validator")({
  head: () => ({ meta: [{ title: "Validator · Meal choice" }] }),
  component: ValidatorPage,
});

function ValidatorPage(): ReactElement {
  return <ValidatorView />;
}
