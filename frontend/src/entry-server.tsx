import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { rotas } from '@/app/routes'

export { ROTAS_PUBLICAS, SEO } from '@/lib/seo'

export async function render(url: string) {
  const handler = createStaticHandler(rotas)
  const contexto = await handler.query(new Request(`http://localhost${url}`))
  if (contexto instanceof Response) throw new Error(`Rota ${url} redirecionou`)
  const router = createStaticRouter(handler.dataRoutes, contexto)
  const queryClient = new QueryClient({ defaultOptions: { queries: { enabled: false } } })

  return renderToString(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouterProvider router={router} context={contexto} hydrate={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
