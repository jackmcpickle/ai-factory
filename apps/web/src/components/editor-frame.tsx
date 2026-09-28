import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'
import { cn } from 'cn'

const EDITOR_LINKS = [
  { to: '/automation', label: 'Automation' },
  { to: '/automation/skills', label: 'Skill library' },
  { to: '/automation/validator', label: 'Validator' },
  { to: '/automation/rules', label: 'Rules' },
  { to: '/automation/integrations', label: 'Integrations' },
] as const

export function EditorFrame({
  children,
}: {
  children: ReactNode
}): ReactElement {
  return (
    <div className="dark flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}

export function EditorNav(): ReactElement {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  return (
    <nav
      aria-label="Automation mock"
      className="flex gap-1 overflow-x-auto px-3"
    >
      {EDITOR_LINKS.map((link) => {
        const active =
          link.to === '/automation'
            ? pathname === '/automation'
            : pathname.startsWith(link.to)
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-[13px]',
              active
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function EditorPage({
  title,
  lede,
  children,
}: {
  title: string
  lede: string
  children: ReactNode
}): ReactElement {
  return (
    <EditorFrame>
      <header className="shrink-0 border-b">
        <div className="flex h-12 items-center gap-2 px-3">
          <Link
            to="/automation"
            aria-label="Back to automation"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-sm font-medium">{title}</h1>
        </div>
        <EditorNav />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-3xl flex-col gap-6 px-6 py-6">
          <p className="text-sm text-muted-foreground">{lede}</p>
          {children}
        </div>
      </div>
    </EditorFrame>
  )
}

export function SectionBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      {children}
    </section>
  )
}
