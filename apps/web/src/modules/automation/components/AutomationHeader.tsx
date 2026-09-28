import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, ChevronDown, Pencil } from "lucide-react";
import { useRef } from "react";
import type { ChangeEvent, ReactElement } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AUTHOR_NAME, REPOSITORIES } from "@/modules/automation/constants";
import { repositoryLabel } from "@/modules/automation/helpers";
import { useAutomationActions } from "@/modules/automation/hooks/useAutomationEditor";
import { useAutomationQuery } from "@/modules/automation/hooks/useAutomationQuery";
import { useRunAutomationMutation } from "@/modules/automation/hooks/useRunAutomationMutation";
import { useSaveAutomationMutation } from "@/modules/automation/hooks/useSaveAutomationMutation";

export function AutomationHeader({
  onRun,
}: {
  onRun: () => void;
}): ReactElement {
  const { automation, status, saveError } = useAutomationQuery();
  const actions = useAutomationActions();
  const { saveAutomationMutation, isSavePending } = useSaveAutomationMutation();
  const { runAutomationMutation, isRunPending } = useRunAutomationMutation();
  const nameRef = useRef<HTMLInputElement>(null);
  const saved = status === "Saved";

  function handleRename(event: ChangeEvent<HTMLInputElement>): void {
    actions.rename(event.target.value);
  }

  function handleSave(): void {
    saveAutomationMutation();
  }

  function handleRunNow(): void {
    runAutomationMutation(new Date().toISOString());
    onRun();
  }

  function handleFocusName(): void {
    nameRef.current?.focus();
  }

  return (
    <header className="shrink-0 border-b">
      <div className="flex h-12 items-center gap-2 px-3">
        <Link
          to="/inbox"
          aria-label="Back"
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <input
          ref={nameRef}
          aria-label="Automation name"
          data-testid="automation-name"
          value={automation.name}
          onChange={handleRename}
          className="w-40 bg-transparent text-sm font-medium outline-none"
        />
        <button
          type="button"
          aria-label="Edit name"
          className="text-muted-foreground hover:text-foreground"
          onClick={handleFocusName}
        >
          <Pencil className="size-3.5" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="run-automation"
            disabled={isRunPending}
            onClick={handleRunNow}
          >
            Run now
          </Button>
          <Button
            type="button"
            size="sm"
            data-testid="save-automation"
            disabled={isSavePending || saved}
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save"}
          </Button>
          <fieldset
            className="ml-1 flex items-center rounded-full border p-0.5 text-xs"
            aria-label="Automation status"
          >
            <button
              type="button"
              aria-pressed={!automation.active}
              className={cn(
                "rounded-full px-2.5 py-1",
                automation.active
                  ? "text-muted-foreground"
                  : "bg-accent text-foreground"
              )}
              onClick={() => actions.setActive(false)}
            >
              Inactive
            </button>
            <button
              type="button"
              aria-pressed={automation.active}
              className={cn(
                "rounded-full px-2.5 py-1",
                automation.active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
              onClick={() => actions.setActive(true)}
            >
              Active
            </button>
          </fieldset>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[13px]"
            >
              {repositoryLabel(automation.repositoryId)}
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => actions.setRepository(null)}>
              Select repository
            </DropdownMenuItem>
            {REPOSITORIES.map((repository) => (
              <DropdownMenuItem
                key={repository.id}
                onSelect={() => actions.setRepository(repository.id)}
              >
                {repository.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-muted-foreground text-xs">By {AUTHOR_NAME}</span>
        <span className="sr-only" data-testid="save-status" aria-live="polite">
          {saved ? "Saved" : saveError || "Unsaved"}
        </span>
      </div>
      {saveError ? (
        <p className="text-destructive px-4 pb-2 text-xs" role="alert">
          {saveError}
        </p>
      ) : null}
    </header>
  );
}
