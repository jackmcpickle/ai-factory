import type { ReactElement, ReactNode } from "react";

import { PageHeader } from "@/components/shell";

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

export function EditorPage({
  title,
  lede,
  icon,
  children,
}: {
  title: string;
  lede: string;
  icon?: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title={title} icon={icon} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
          <p className="text-muted-foreground text-sm">{lede}</p>
          {children}
        </div>
      </div>
    </div>
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
