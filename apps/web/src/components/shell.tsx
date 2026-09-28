import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import {
  Bot,
  Inbox,
  Layers,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { CommandMenu } from "#/components/command-menu";
import { CreateIssueDialog } from "#/components/create-issue-dialog";
import {
  isWebhook,
  triggerLabel,
  useFactory,
  webhookTrigger,
} from "#/components/factory";
import { UserAvatar } from "#/components/people";
import { UiProvider, useUi } from "#/components/ui-state";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "#/components/ui/sheet";
import { CURRENT_USER_ID, teamMeta } from "#/lib/catalog";
import {
  SAVED_VIEWS,
  defaultTrigger,
  issueSearch,
  sameFilters,
  validateIssueSearch,
} from "#/lib/search";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <UiProvider>
      <ShellLayout>{children}</ShellLayout>
    </UiProvider>
  );
}

function ShellLayout({ children }: { children: ReactNode }) {
  const { navOpen, setNavOpen } = useUi();
  return (
    <>
      <div className="bg-background text-foreground flex h-dvh overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent
            side="left"
            className="bg-sidebar w-[260px] p-0"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      <CommandMenu />
      <CreateIssueDialog />
    </>
  );
}

export function PageHeader({
  title,
  icon,
  count,
  actions,
}: {
  title: string;
  icon?: ReactNode;
  count?: number;
  actions?: ReactNode;
}) {
  const { setNavOpen } = useUi();
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setNavOpen(true)}
        aria-label="Open sidebar"
      >
        <Layers />
      </Button>
      {icon}
      <h1 className="truncate text-[13px] font-medium">{title}</h1>
      {typeof count === "number" ? (
        <span className="text-muted-foreground text-[12px] tabular-nums">
          {count}
        </span>
      ) : null}
      <div className="ml-auto flex items-center gap-1">{actions}</div>
    </header>
  );
}

function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const factory = useFactory();
  const { setCommandOpen } = useUi();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const rawSearch = useRouterState({
    select: (state) => state.location.search,
  });
  const search = validateIssueSearch(rawSearch);
  const unread = factory.issues.filter(
    (issue) => issue.outcome && !factory.inboxRead[issue.id]
  ).length;
  const user = factory.result.workspace.users.find(
    (item) => item.id === CURRENT_USER_ID
  );

  return (
    <aside
      className={cn(
        "bg-sidebar flex h-full min-h-0 w-[244px] shrink-0 flex-col border-r",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="bg-brand flex size-[18px] items-center justify-center rounded-[4px] text-[10px] font-semibold text-white">
          M
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium">Meal choice</div>
          <div className="text-muted-foreground truncate text-[11px]">
            Synthetic dry run
          </div>
        </div>
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:bg-sidebar-accent mx-2 mt-2 flex h-7 items-center gap-2 rounded-md px-2 text-left text-[13px]"
        onClick={() => {
          onNavigate?.();
          setCommandOpen(true);
        }}
      >
        <Search className="size-3.5" />
        Search
        <span className="ml-auto text-[11px]">⌘K</span>
      </button>
      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-0.5 px-2 py-2" aria-label="Workspace">
          <NavLink
            to="/inbox"
            icon={<Inbox className="size-4" />}
            label="Inbox"
            count={unread}
            active={pathname === "/inbox"}
            onNavigate={onNavigate}
          />
          {SAVED_VIEWS.filter(
            (view) => view.id === "mine" || view.id === "all"
          ).map((view) => (
            <NavLink
              key={view.id}
              to="/issues"
              search={issueSearch(view.search)}
              icon={<Layers className="size-4" />}
              label={view.name}
              active={
                pathname === "/issues" && sameFilters(search, view.search)
              }
              onNavigate={onNavigate}
            />
          ))}
          <Section label="Workspace" />
          {SAVED_VIEWS.filter((view) =>
            ["review-ready", "human-only", "needs-info", "active"].includes(
              view.id
            )
          ).map((view) => (
            <NavLink
              key={view.id}
              to="/issues"
              search={issueSearch(view.search)}
              icon={<Shield className="size-4" />}
              label={view.name}
              active={
                pathname === "/issues" && sameFilters(search, view.search)
              }
              onNavigate={onNavigate}
            />
          ))}
          <NavLink
            to="/projects"
            icon={<Layers className="size-4" />}
            label="Projects"
            active={pathname.startsWith("/projects")}
            onNavigate={onNavigate}
          />
          <NavLink
            to="/views"
            icon={<Layers className="size-4" />}
            label="Views"
            active={pathname === "/views"}
            onNavigate={onNavigate}
          />
          <NavLink
            to="/policy"
            icon={<Shield className="size-4" />}
            label="Policy"
            active={pathname === "/policy"}
            onNavigate={onNavigate}
          />
          <NavLink
            to="/"
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
            active={pathname === "/"}
            onNavigate={onNavigate}
          />
          <NavLink
            to="/automation"
            icon={<Bot className="size-4" />}
            label="Automations"
            active={pathname.startsWith("/automation")}
            onNavigate={onNavigate}
          />
          <Section label="Your teams" />
          {factory.result.workspace.teams.map((team) => (
            <NavLink
              key={team.id}
              to="/teams/$teamId"
              params={{ teamId: team.id }}
              icon={
                <span
                  className="size-3.5 rounded-[3px]"
                  style={{ background: teamMeta(team.id).color }}
                />
              }
              label={teamMeta(team.id).name}
              active={pathname === `/teams/${team.id}`}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>
      <UserMenu name={user?.name ?? "Synthetic PM"} onNavigate={onNavigate} />
    </aside>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground mt-3 px-2 pb-1 text-[11px] font-medium">
      {label}
    </div>
  );
}

function NavLink({
  icon,
  label,
  count,
  active,
  onNavigate,
  ...props
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onNavigate?: () => void;
  to: string;
  search?: ReturnType<typeof issueSearch>;
  params?: { teamId: string };
}) {
  return (
    <Link
      {...(props as { to: "/" })}
      onClick={onNavigate}
      className={cn(
        "flex h-7 items-center gap-2 rounded-md px-2 text-[13px]",
        active
          ? "bg-sidebar-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="text-brand ml-auto text-[11px] tabular-nums">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function UserMenu({
  name,
  onNavigate,
}: {
  name: string;
  onNavigate?: () => void;
}) {
  const factory = useFactory();
  const { setCreateOpen } = useUi();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- the theme lives on <html> (set by the no-flash script), which is only readable after hydration.
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("meal-theme", next);
    setTheme(next);
  }

  return (
    <div className="border-t p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:bg-sidebar-accent flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left"
          >
            <UserAvatar
              userId={CURRENT_USER_ID}
              users={factory.result.workspace.users}
            />
            <span className="truncate text-[13px]">{name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
            {triggerLabel(factory.trigger)} · {factory.result.policy.version}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              onNavigate?.();
              setCreateOpen(true);
            }}
          >
            <Plus /> New issue
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              factory.setTrigger(
                isWebhook(factory.trigger) ? defaultTrigger : webhookTrigger
              )
            }
          >
            {isWebhook(factory.trigger)
              ? "Use daily review"
              : "Use feedback webhook"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => factory.applyUiHumanOnly()}>
            Treat ui as human-only
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => factory.resetPolicy()}>
            Reset policy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
