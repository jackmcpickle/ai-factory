import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

const EDITOR_LINKS = [
  { to: "/automation", label: "Automation" },
  { to: "/automation/skills", label: "Skill library" },
  { to: "/automation/validator", label: "Validator" },
  { to: "/automation/rules", label: "Rules" },
  { to: "/automation/integrations", label: "Integrations" },
] as const;

export function EditorFrame({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="dark bg-background text-foreground flex h-dvh min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}

export function EditorNav(): ReactElement {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return (
    <nav
      aria-label="Automation mock"
      className="flex gap-1 overflow-x-auto px-3"
    >
      {EDITOR_LINKS.map((link) => {
        const active =
          link.to === "/automation"
            ? pathname === "/automation"
            : pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-[13px]",
              active
                ? "border-foreground text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function EditorPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}): ReactElement {
  return (
    <EditorFrame>
      <header className="shrink-0 border-b">
        <div className="flex h-12 items-center gap-2 px-3">
          <Link
            to="/automation"
            aria-label="Back to automation"
            className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-sm font-medium">{title}</h1>
        </div>
        <EditorNav />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-3xl flex-col gap-6 px-6 py-6">
          <p className="text-muted-foreground text-sm">{lede}</p>
          {children}
        </div>
      </div>
    </EditorFrame>
  );
}

export function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}
