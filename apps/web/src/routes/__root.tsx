import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TooltipProvider } from '#/components/ui/tooltip'
import appCss from '../styles.css?url'
import '@fontsource-variable/inter'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Meal choice · Delivery' },
      { name: 'theme-color', content: '#101012' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('meal-theme')==='light')document.documentElement.classList.remove('dark')}catch(e){}",
          }}
        />
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="grid h-dvh place-items-center text-center">
      <div>
        <h1 className="text-base font-medium">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          That view is not in this workspace.
        </p>
      </div>
    </div>
  )
}
