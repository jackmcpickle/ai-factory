import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useFactory } from "#/components/factory";
import { PriorityIcon, StatusIcon } from "#/components/icons";
import { useUi } from "#/components/ui-state";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#/components/ui/dialog";
import type { Priority, Status } from "#/data/types";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  teamMeta,
} from "#/lib/catalog";

export function CreateIssueDialog() {
  const { createOpen, setCreateOpen } = useUi();
  const factory = useFactory();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("team-app");
  const [status, setStatus] = useState<Status>("todo");
  const [priority, setPriority] = useState<Priority>("medium");

  function close() {
    setCreateOpen(false);
    setTitle("");
    setDescription("");
  }

  function submit() {
    if (!title.trim()) {
      return;
    }
    const draft = factory.createDraft({
      title,
      description,
      teamId,
      status,
      priority,
    });
    close();
    void navigate({ to: "/issues/$issueId", params: { issueId: draft.id } });
  }

  return (
    <Dialog
      open={createOpen}
      onOpenChange={(open) => (open ? setCreateOpen(true) : close())}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">New issue</DialogTitle>
        <DialogDescription className="sr-only">
          Create a local draft. It is not sent through the orchestrator.
        </DialogDescription>
        <div className="px-4 pt-4 pb-2">
          <div className="text-muted-foreground mb-2 text-[12px]">
            {teamMeta(teamId).name} · local draft
          </div>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Issue title"
            aria-label="Issue title"
            className="placeholder:text-muted-foreground w-full bg-transparent text-lg font-medium outline-none"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a description"
            aria-label="Description"
            rows={4}
            className="placeholder:text-muted-foreground mt-2 w-full resize-none bg-transparent text-[13px] outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2">
          <select
            aria-label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as Status)}
            className="bg-accent h-7 rounded-md px-2 text-[12px]"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </select>
          <select
            aria-label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="bg-accent h-7 rounded-md px-2 text-[12px]"
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {PRIORITY_LABEL[item]}
              </option>
            ))}
          </select>
          <select
            aria-label="Team"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="bg-accent h-7 rounded-md px-2 text-[12px]"
          >
            {factory.result.workspace.teams.map((team) => (
              <option key={team.id} value={team.id}>
                {teamMeta(team.id).name}
              </option>
            ))}
          </select>
          <span className="sr-only">
            <StatusIcon status={status} />
            <PriorityIcon priority={priority} />
          </span>
          <Button
            size="sm"
            className="ml-auto"
            disabled={!title.trim()}
            onClick={submit}
          >
            Create issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
