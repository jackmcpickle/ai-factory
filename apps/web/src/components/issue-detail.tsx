import { Link } from "@tanstack/react-router";
import { useEffect, useEffectEvent, useState } from "react";
import type { ReactNode } from "react";

import { useFactory } from "#/components/factory";
import { PriorityIcon, StatusIcon } from "#/components/icons";
import { LabelPill, TeamMark, UserAvatar } from "#/components/people";
import { PageHeader } from "#/components/shell";
import { Button } from "#/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Textarea } from "#/components/ui/textarea";
import type { IssueView, SafetyDecision } from "#/data/types";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  money,
  teamMeta,
  userMeta,
} from "#/lib/catalog";
import { commentsFor, EVENT_COPY } from "#/lib/issues";
import { issueSearch } from "#/lib/search";

export function IssueDetail({ issue }: { issue: IssueView }) {
  const factory = useFactory();
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [comment, setComment] = useState("");
  const [syncedIssue, setSyncedIssue] = useState(issue);
  const comments = commentsFor(factory.comments, issue.id);
  const markRead = useEffectEvent((id: string) => factory.markRead(id));

  // Reset the local edit buffers when the issue (or its saved text) changes.
  if (
    syncedIssue.id !== issue.id ||
    syncedIssue.title !== issue.title ||
    syncedIssue.description !== issue.description
  ) {
    setSyncedIssue(issue);
    setTitle(issue.title);
    setDescription(issue.description);
    setComment("");
  }

  useEffect(() => {
    document.title = `${issue.id} ${issue.title} · Meal choice`;
    markRead(issue.id);
  }, [issue.id, issue.title]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={issue.id}
        icon={<StatusIcon status={issue.status} />}
        actions={
          <span className="text-muted-foreground text-[12px]">
            {factory.isFetching ? "Updating · " : ""}
            {issue.draft ? "Local draft" : factory.result.policy.version}
          </span>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-w-0 flex-1 overflow-auto px-6 py-5">
          <div className="text-muted-foreground mb-3 flex items-center gap-2 text-[12px]">
            <Link
              to="/issues"
              search={issueSearch()}
              className="hover:text-foreground"
            >
              Signals
            </Link>
            <span>/</span>
            <span>{issue.id}</span>
          </div>
          <input
            value={title}
            aria-label="Issue title"
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              if (title.trim() && title !== issue.title) {
                factory.updateIssue(issue.id, { title: title.trim() });
              }
            }}
            className="w-full bg-transparent text-[22px] font-semibold tracking-tight outline-none"
          />
          <textarea
            value={description}
            aria-label="Description"
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => {
              if (description !== issue.description) {
                factory.updateIssue(issue.id, { description });
              }
            }}
            className="text-foreground/90 mt-4 min-h-28 w-full resize-none bg-transparent text-[14px] leading-6 outline-none"
          />
          {issue.labelIds.some(
            (id) =>
              id === "human-only" ||
              id === "catering-commitment" ||
              id === "dietary"
          ) ? (
            <p className="text-muted-foreground mt-2 text-[13px]">
              Human gate. This dry run can describe the check, and it cannot
              infer dietary safety or commit a booking or catering order.
            </p>
          ) : null}
          {issue.outcome ? (
            <section className="mt-8">
              <h2 className="mb-2 text-[13px] font-medium">Trace</h2>
              <ol className="flex flex-col">
                {issue.events.map((event) => {
                  const owner = Object.hasOwn(factory.result.roles, event.agent)
                    ? factory.result.roles[event.agent]
                    : undefined;
                  return (
                    <li
                      key={event.sequence}
                      className="flex gap-3 border-l py-2 pl-3"
                    >
                      <div>
                        <div className="text-[13px]">
                          <span className="font-medium">{event.agent}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {event.event}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[13px]">
                          {EVENT_COPY[event.event] ?? event.event}
                          {owner ? ` Human owner: ${owner.humanOwner}.` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
          {issue.outcome?.checks.length ? (
            <section className="mt-6">
              <h2 className="mb-2 text-[13px] font-medium">Supplied checks</h2>
              <ul className="flex flex-col gap-1">
                {issue.outcome.checks.map((check) => (
                  <li
                    key={check.name}
                    className="flex items-center gap-2 text-[13px]"
                  >
                    <span
                      className={
                        check.passed ? "text-brand" : "text-destructive"
                      }
                    >
                      {check.passed ? "Pass" : "Fail"}
                    </span>
                    <span className="text-muted-foreground">{check.name}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-2 text-[12px]">
                Fixture flags, not command output from CI.
              </p>
            </section>
          ) : null}
          {!issue.draft && issue.labelIds.includes("human-only") ? (
            <SafetySamples />
          ) : null}
          <section className="mt-8">
            <h2 className="mb-3 text-[13px] font-medium">Activity</h2>
            <ul className="flex flex-col gap-3">
              {comments.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <UserAvatar
                    userId={item.authorId}
                    users={factory.result.workspace.users}
                  />
                  <div>
                    <div className="text-[13px]">
                      {
                        factory.result.workspace.users.find(
                          (user) => user.id === item.authorId
                        )?.name
                      }
                    </div>
                    <p className="text-muted-foreground text-[13px]">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                factory.addComment(issue.id, comment);
                setComment("");
              }}
            >
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Leave a comment"
                aria-label="Comment"
                className="min-h-16"
              />
              <Button type="submit" size="sm" disabled={!comment.trim()}>
                Comment
              </Button>
            </form>
          </section>
        </div>
        <aside className="border-t px-2 py-3 lg:w-[280px] lg:overflow-auto lg:border-t-0 lg:border-l">
          <Property label="Status">
            <OptionPicker
              current={STATUS_LABEL[issue.status]}
              icon={<StatusIcon status={issue.status} />}
            >
              {STATUSES.map((status) => (
                <Option
                  key={status}
                  active={issue.status === status}
                  onSelect={() => factory.updateIssue(issue.id, { status })}
                >
                  <StatusIcon status={status} />
                  {STATUS_LABEL[status]}
                </Option>
              ))}
            </OptionPicker>
          </Property>
          <Property label="Priority">
            <OptionPicker
              current={PRIORITY_LABEL[issue.priority]}
              icon={<PriorityIcon priority={issue.priority} />}
            >
              {PRIORITIES.map((priority) => (
                <Option
                  key={priority}
                  active={issue.priority === priority}
                  onSelect={() => factory.updateIssue(issue.id, { priority })}
                >
                  <PriorityIcon priority={priority} />
                  {PRIORITY_LABEL[priority]}
                </Option>
              ))}
            </OptionPicker>
          </Property>
          <Property label="Assignee">
            <OptionPicker
              current={
                factory.result.workspace.users.find(
                  (user) => user.id === issue.assigneeId
                )?.name ?? "Unassigned"
              }
              icon={
                <UserAvatar
                  userId={issue.assigneeId}
                  users={factory.result.workspace.users}
                />
              }
            >
              {factory.result.workspace.users.map((user) => (
                <Option
                  key={user.id}
                  active={issue.assigneeId === user.id}
                  onSelect={() =>
                    factory.updateIssue(issue.id, { assigneeId: user.id })
                  }
                >
                  <UserAvatar
                    userId={user.id}
                    users={factory.result.workspace.users}
                  />
                  <span>
                    {user.name}
                    <span className="text-muted-foreground ml-2">
                      {userMeta(user.id).role}
                    </span>
                  </span>
                </Option>
              ))}
            </OptionPicker>
          </Property>
          <Property label="Team">
            <span className="flex items-center gap-2 px-1.5 text-[13px]">
              <TeamMark teamId={issue.teamId} />
              {teamMeta(issue.teamId).name}
            </span>
          </Property>
          <Property label="Labels">
            <span className="flex flex-wrap gap-1 px-1">
              {issue.labelIds.map((id) => (
                <LabelPill key={id} id={id} />
              ))}
            </span>
          </Property>
          <Property label="Project">
            <span className="px-1.5 text-[13px]">{issue.projectId}</span>
          </Property>
          {issue.outcome ? (
            <>
              <Property label="Route">
                <span className="px-1.5 text-[13px]">
                  {issue.outcome.route}
                </span>
              </Property>
              <Property label="Cost">
                <span className="px-1.5 text-[13px] tabular-nums">
                  {money(issue.outcome.estimatedUsd)}
                </span>
              </Property>
              <Property label="Human">
                <span className="px-1.5 text-[13px]">
                  {issue.outcome.requiredHuman}
                </span>
              </Property>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SafetySamples() {
  const { safety } = useFactory().result;
  const rows: { label: string; decision: SafetyDecision }[] = [
    { label: "Complete synthetic authority", decision: safety.review },
    { label: "Dietary attributes differ", decision: safety.dietaryMismatch },
    { label: "Replay of the idempotency key", decision: safety.replay },
    { label: "Missing idempotency key", decision: safety.missingKey },
  ];
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[13px] font-medium">Safety gate</h2>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.label} className="rounded-md border px-3 py-2">
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span>{row.label}</span>
              <span className="font-medium">{row.decision.decision}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-[12px]">
              {row.decision.failures.length
                ? row.decision.failures.join(", ")
                : "No failing checks."}{" "}
              Commitment executed:{" "}
              {row.decision.commitmentExecuted ? "yes" : "no"}.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-2 py-1">
      <div className="text-muted-foreground w-20 shrink-0 pt-1 text-[12px]">
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function OptionPicker({
  current,
  icon,
  children,
}: {
  current: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent flex h-7 w-full items-center gap-2 rounded px-1.5 text-left text-[13px]"
        >
          {icon}
          <span className="truncate">{current}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        {children}
      </PopoverContent>
    </Popover>
  );
}

function Option({
  active,
  onSelect,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px]"
      onClick={onSelect}
    >
      {children}
      {active ? <span className="text-brand ml-auto">✓</span> : null}
    </button>
  );
}
