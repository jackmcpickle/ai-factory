import { ShieldCheck } from "lucide-react";
import type { ReactElement } from "react";

import { EditorPage } from "@/components/editor-frame";
import { AGENT_ID, AgentUsageReadout } from "@/modules/dashboard";
import { ValidationResultList } from "@/modules/validator/components/ValidationResultList";
import { ValidatorForm } from "@/modules/validator/components/ValidatorForm";

export function ValidatorView(): ReactElement {
  return (
    <EditorPage
      title="Validator"
      icon={<ShieldCheck className="text-muted-foreground size-4" />}
      lede="Write what to validate, pick a part of the app, and add keywords. Running a validation only updates the result on this page."
    >
      <AgentUsageReadout agentId={AGENT_ID.validator} />
      <ValidatorForm />
      <ValidationResultList />
    </EditorPage>
  );
}
