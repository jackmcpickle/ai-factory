import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { SectionBlock } from '@/components/editor-frame'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TOOL_CATALOG } from '@/modules/automation/constants'
import { useAutomationActions } from '@/modules/automation/hooks/useAutomationEditor'
import { useAutomationQuery } from '@/modules/automation/hooks/useAutomationQuery'

export function ToolsSection(): ReactElement {
  const { automation } = useAutomationQuery()
  const actions = useAutomationActions()
  const [memoriesOpen, setMemoriesOpen] = useState(false)
  const memories = automation.tools.find((tool) => tool.kind === 'memories')

  return (
    <SectionBlock title="Tools">
      <ul className="flex flex-col gap-2" data-testid="tool-list">
        {automation.tools.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="flex-1">{tool.name}</span>
            {tool.kind === 'memories' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMemoriesOpen((open) => !open)}
              >
                Manage
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${tool.name}`}
              onClick={() => actions.removeTool(tool.id)}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      {memories && memoriesOpen ? (
        <p className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
          Memories stay with this automation on this page. Nothing is stored
          anywhere else.
        </p>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus /> Add Tool or MCP
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {TOOL_CATALOG.map((tool) => (
            <DropdownMenuItem
              key={tool.id}
              onSelect={() => actions.addTool(tool.id)}
            >
              {tool.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SectionBlock>
  )
}
