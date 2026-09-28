import { cn } from "cn";

import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import type { WorkspaceUser } from "#/data/types";
import { labelMeta, teamMeta, userMeta } from "#/lib/catalog";

export function UserAvatar({
  userId,
  users,
  className,
}: {
  userId: string | null;
  users: WorkspaceUser[];
  className?: string;
}) {
  if (!userId) {
    return (
      <span
        className={cn(
          "border-muted-foreground/50 inline-flex size-5 shrink-0 rounded-full border border-dashed",
          className
        )}
        aria-label="Unassigned"
      />
    );
  }
  const user = users.find((item) => item.id === userId);
  const meta = userMeta(userId);
  return (
    <Avatar className={cn("size-5", className)} title={user?.name ?? userId}>
      <AvatarFallback
        className="text-[9px] font-medium text-white"
        style={{ background: meta.color }}
      >
        {meta.initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function TeamMark({
  teamId,
  className,
}: {
  teamId: string;
  className?: string;
}) {
  const team = teamMeta(teamId);
  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[8px] font-semibold text-white",
        className
      )}
      style={{ background: team.color }}
      aria-hidden
    >
      {team.key.slice(0, 1)}
    </span>
  );
}

export function LabelPill({ id }: { id: string }) {
  const meta = labelMeta(id);
  return (
    <span
      className="inline-flex h-[18px] items-center rounded-[4px] px-1.5 text-[11px] leading-none"
      style={{ background: `${meta.color}22`, color: meta.color }}
    >
      {meta.name}
    </span>
  );
}
