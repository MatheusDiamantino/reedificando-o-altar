import { useQueryClient } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ApiError } from '@/lib/api'
import { AdminLayout } from './layout/AdminLayout'
import { AgendaAdminPage } from './paginas/agenda/AgendaAdminPage'
import { EntrarPage } from './paginas/acesso/EntrarPage'
import { EsqueciPage } from './paginas/acesso/EsqueciPage'
import { RedefinirPage } from './paginas/acesso/RedefinirPage'
import { ConteudoPage } from './paginas/conteudo/ConteudoPage'
import { LivesAdminPage } from './paginas/lives/LivesAdminPage'
import { MensagensPage } from './paginas/mensagens/MensagensPage'
import { PainelPage } from './paginas/painel/PainelPage'
import { UsuariosPage } from './paginas/usuarios/UsuariosPage'
import { useSessao } from './sessao'
import { Avisos } from './ui/avisos'
import { Confirmacao } from './ui/confirmar'

function Protegido({ children, soAdmin = false }: { children: ReactNode; soAdmin?: boolean }) {
  const { data: usuario, isLoading } = useSessao()
  const { pathname } = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center">
        <span className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }
  if (!usuario) return <Navigate to="/admin/entrar" replace state={{ de: pathname }} />
  if (soAdmin && usuario.papel !== 'admin') return <Navigate to="/admin" replace />
  return children
}

export function AdminRoot() {
  const qc = useQueryClient()

  useEffect(() => {
    const expirou = (erro: unknown) => erro instanceof ApiError && erro.status === 401
    const desligarConsultas = qc.getQueryCache().subscribe((e) => {
      if (e.type === 'updated' && e.query.queryKey[0] !== 'sessao' && expirou(e.query.state.error)) {
        qc.setQueryData(['sessao'], null)
      }
    })
    const desligarGravacoes = qc.getMutationCache().subscribe((e) => {
      if (
        e.type === 'updated' &&
        expirou(e.mutation?.state.error) &&
        e.mutation?.options.mutationKey?.[0] !== 'entrar'
      ) {
        qc.setQueryData(['sessao'], null)
      }
    })
    return () => {
      desligarConsultas()
      desligarGravacoes()
    }
  }, [qc])

  useEffect(() => {
    document.title = 'Painel | Reedificando o Altar'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  return (
    <div className="min-h-svh bg-ink text-paper">
      <Routes>
        <Route path="entrar" element={<EntrarPage />} />
        <Route path="esqueci" element={<EsqueciPage />} />
        <Route path="redefinir" element={<RedefinirPage />} />
        <Route
          element={
            <Protegido>
              <AdminLayout />
            </Protegido>
          }
        >
          <Route index element={<PainelPage />} />
          <Route path="lives" element={<LivesAdminPage />} />
          <Route path="agenda" element={<AgendaAdminPage />} />
          <Route
            path="mensagens"
            element={
              <Protegido soAdmin>
                <MensagensPage />
              </Protegido>
            }
          />
          <Route
            path="conteudo"
            element={
              <Protegido soAdmin>
                <ConteudoPage />
              </Protegido>
            }
          />
          <Route
            path="usuarios"
            element={
              <Protegido soAdmin>
                <UsuariosPage />
              </Protegido>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
      <Avisos />
      <Confirmacao />
    </div>
  )
}
