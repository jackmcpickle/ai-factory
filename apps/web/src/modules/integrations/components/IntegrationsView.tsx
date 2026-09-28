import { Plug } from "lucide-react";
import type { ReactElement } from "react";

import { EditorPage } from "@/components/editor-frame";
import { IntegrationsPanel } from "@/modules/integrations/components/IntegrationsPanel";

export function IntegrationsView(): ReactElement {
  return (
    <EditorPage
      title="Integrations"
      icon={<Plug className="text-muted-foreground size-4" />}
      lede="Connect Slack, webhooks, Jira, email, and similar tools. Connection details stay on this page. Nothing is sent to those services."
    >
      <IntegrationsPanel />
    </EditorPage>
  );
}
