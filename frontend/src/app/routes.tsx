import type { RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/home/HomePage'
import { Layout } from './Layout'

export const rotas: RouteObject[] = [
  {
    path: '/admin/*',
    lazy: () => import('@/admin/AdminRoot').then((m) => ({ Component: m.AdminRoot })),
  },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/sobre', lazy: () => import('@/pages/sobre/SobrePage').then((m) => ({ Component: m.SobrePage })) },
      { path: '/lives', lazy: () => import('@/pages/lives/LivesPage').then((m) => ({ Component: m.LivesPage })) },
      { path: '/agenda', lazy: () => import('@/pages/agenda/AgendaPage').then((m) => ({ Component: m.AgendaPage })) },
      { path: '/visite', lazy: () => import('@/pages/visite/VisitePage').then((m) => ({ Component: m.VisitePage })) },
      {
        path: '/contato',
        lazy: () => import('@/pages/contato/ContatoPage').then((m) => ({ Component: m.ContatoPage })),
      },
      {
        path: '*',
        lazy: () => import('@/pages/not-found/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]
