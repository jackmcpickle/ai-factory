import { useNavigate } from "@tanstack/react-router";

import {
  isWebhook,
  triggerLabel,
  useFactory,
  webhookTrigger,
} from "#/components/factory";
import { StatusIcon } from "#/components/icons";
import { useUi } from "#/components/ui-state";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#/components/ui/command";
import { SAVED_VIEWS, defaultTrigger, issueSearch } from "#/lib/search";

export function CommandMenu() {
  const { commandOpen, setCommandOpen, setCreateOpen } = useUi();
  const factory = useFactory();
  const navigate = useNavigate();

  function go(run: () => void) {
    setCommandOpen(false);
    run();
  }

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      className="sm:max-w-xl"
    >
      <CommandInput placeholder="Search signals, views, and commands" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Signals">
          {factory.issues.map((issue) => (
            <CommandItem
              key={issue.id}
              value={`${issue.id} ${issue.title}`}
              onSelect={() =>
                go(() =>
                  navigate({
                    to: "/issues/$issueId",
                    params: { issueId: issue.id },
                  })
                )
              }
            >
              <StatusIcon status={issue.status} />
              <span className="text-muted-foreground font-mono text-xs">
                {issue.id}
              </span>
              <span className="truncate">{issue.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {SAVED_VIEWS.map((view) => (
            <CommandItem
              key={view.id}
              value={view.name}
              onSelect={() =>
                go(() =>
                  navigate({ to: "/issues", search: issueSearch(view.search) })
                )
              }
            >
              {view.name}
            </CommandItem>
          ))}
          <CommandItem
            value="Projects"
            onSelect={() => go(() => navigate({ to: "/projects" }))}
          >
            Projects
          </CommandItem>
          <CommandItem
            value="Policy"
            onSelect={() => go(() => navigate({ to: "/policy" }))}
          >
            Policy
          </CommandItem>
          <CommandItem
            value="Inbox"
            onSelect={() => go(() => navigate({ to: "/inbox" }))}
          >
            Inbox
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Commands">
          <CommandItem
            value="New issue"
            onSelect={() => go(() => setCreateOpen(true))}
          >
            New issue
          </CommandItem>
          <CommandItem
            value={triggerLabel(factory.trigger)}
            onSelect={() =>
              go(() =>
                factory.setTrigger(
                  isWebhook(factory.trigger) ? defaultTrigger : webhookTrigger
                )
              )
            }
          >
            {isWebhook(factory.trigger)
              ? "Switch to daily review"
              : "Switch to feedback webhook"}
          </CommandItem>
          <CommandItem
            value="Treat ui as human-only"
            onSelect={() => go(() => factory.applyUiHumanOnly())}
          >
            Treat ui as human-only
          </CommandItem>
          <CommandItem
            value="Reset policy"
            onSelect={() => go(() => factory.resetPolicy())}
          >
            Reset policy to the file
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
