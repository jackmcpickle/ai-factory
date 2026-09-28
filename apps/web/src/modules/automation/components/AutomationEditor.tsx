import { useState } from "react";
import type { ReactElement } from "react";

import { EditorFrame } from "@/components/editor-frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentInstructions } from "@/modules/automation/components/AgentInstructions";
import { AutomationHeader } from "@/modules/automation/components/AutomationHeader";
import { RunHistory } from "@/modules/automation/components/RunHistory";
import { ToolsSection } from "@/modules/automation/components/ToolsSection";
import { TriggerSection } from "@/modules/automation/components/TriggerSection";
import { useAutomationQuery } from "@/modules/automation/hooks/useAutomationQuery";
import { AUTOMATION_TAB } from "@/modules/automation/types";
import type { AutomationTab } from "@/modules/automation/types";
import { AGENT_ID, AgentUsageReadout } from "@/modules/dashboard";

export function AutomationEditor(): ReactElement {
  const { runs } = useAutomationQuery();
  const [tab, setTab] = useState<AutomationTab>(AUTOMATION_TAB.settings);

  function handleRun(): void {
    setTab(AUTOMATION_TAB.history);
  }

  function handleTab(value: string): void {
    if (value === AUTOMATION_TAB.history) {
      setTab(AUTOMATION_TAB.history);
      return;
    }
    setTab(AUTOMATION_TAB.settings);
  }

  return (
    <EditorFrame>
      <AutomationHeader onRun={handleRun} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-3xl flex-col gap-6 px-6 py-4">
          <AgentUsageReadout agentId={AGENT_ID.automations} />
          <Tabs value={tab} onValueChange={handleTab}>
            <TabsList variant="line">
              <TabsTrigger value={AUTOMATION_TAB.settings}>
                Settings
              </TabsTrigger>
              <TabsTrigger value={AUTOMATION_TAB.history}>
                Run History{runs.length > 0 ? ` (${runs.length})` : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value={AUTOMATION_TAB.settings}
              className="flex flex-col gap-8 pt-4"
            >
              <TriggerSection />
              <AgentInstructions />
              <ToolsSection />
            </TabsContent>
            <TabsContent value={AUTOMATION_TAB.history} className="pt-4">
              <RunHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </EditorFrame>
  );
}
