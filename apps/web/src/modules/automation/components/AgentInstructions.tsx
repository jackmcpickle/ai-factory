import { ChevronDown } from 'lucide-react'
import type { ChangeEvent, ReactElement } from 'react'
import { SectionBlock } from '@/components/editor-frame'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MODEL_OPTIONS } from '@/modules/automation/constants'
import { modelLabel } from '@/modules/automation/helpers'
import { useAutomationActions } from '@/modules/automation/hooks/useAutomationEditor'
import { useAutomationQuery } from '@/modules/automation/hooks/useAutomationQuery'

export function AgentInstructions(): ReactElement {
  const { automation } = useAutomationQuery()
  const actions = useAutomationActions()

  function handleInstructions(event: ChangeEvent<HTMLTextAreaElement>): void {
    actions.setInstructions(event.target.value)
  }

  return (
    <SectionBlock title="Agent instructions">
      <div className="flex items-start gap-2">
        <textarea
          aria-label="Agent instructions"
          value={automation.instructions}
          placeholder="Type @ for tools, / for commands..."
          onChange={handleInstructions}
          className="min-h-36 flex-1 resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {modelLabel(automation.modelId)}
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {MODEL_OPTIONS.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onSelect={() => actions.setModel(model.id)}
              >
                {model.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SectionBlock>
  )
}
