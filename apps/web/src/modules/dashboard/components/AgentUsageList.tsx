import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { FEATURE_PATH } from "@/lib/features";
import { AgentUsageFigures } from "@/modules/dashboard/components/AgentUsageFigures";
import { AGENT_ID } from "@/modules/dashboard/types";
import type { AgentUsage } from "@/modules/dashboard/types";

export function AgentUsageList({
  agents,
}: {
  agents: readonly AgentUsage[];
}): ReactElement {
  return (
    <section aria-label="Agent usage" className="flex flex-col gap-3">
      <h2 className="text-[13px] font-medium">Agents</h2>
      <ul className="flex flex-col gap-2">
        {agents.map((agent) => (
          <li key={agent.id} className="rounded-md border px-3 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{agent.label}</h3>
              <AgentSectionLink agent={agent} />
            </div>
            <AgentUsageFigures usage={agent} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AgentSectionLink({ agent }: { agent: AgentUsage }): ReactElement {
  const className = "text-[12px] text-muted-foreground hover:text-foreground";
  const label = `Open ${agent.label}`;
  switch (agent.id) {
    case AGENT_ID.skills: {
      return (
        <Link to={FEATURE_PATH.skills} aria-label={label} className={className}>
          Open
        </Link>
      );
    }
    case AGENT_ID.validator: {
      return (
        <Link
          to={FEATURE_PATH.validator}
          aria-label={label}
          className={className}
        >
          Open
        </Link>
      );
    }
    case AGENT_ID.rules: {
      return (
        <Link to={FEATURE_PATH.rules} aria-label={label} className={className}>
          Open
        </Link>
      );
    }
    case AGENT_ID.automations: {
      return (
        <Link
          to={FEATURE_PATH.automation}
          aria-label={label}
          className={className}
        >
          Open
        </Link>
      );
    }
    default: {
      const unknownAgent: never = agent.id;
      throw new Error(`Unknown agent ${unknownAgent}`);
    }
  }
}
