import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useSair, useSessao } from '../sessao'
import { Icone, type NomeIcone } from '../ui/Icone'

const ITENS: { to: string; rotulo: string; icone: NomeIcone; soAdmin?: boolean }[] = [
  { to: '/admin', rotulo: 'Painel', icone: 'painel' },
  { to: '/admin/lives', rotulo: 'Lives', icone: 'live' },
  { to: '/admin/agenda', rotulo: 'Agenda', icone: 'agenda' },
  { to: '/admin/mensagens', rotulo: 'Mensagens', icone: 'mensagem', soAdmin: true },
  { to: '/admin/conteudo', rotulo: 'Conteúdo', icone: 'conteudo', soAdmin: true },
  { to: '/admin/usuarios', rotulo: 'Usuários', icone: 'usuarios', soAdmin: true },
]

export function AdminLayout() {
  const { data: usuario } = useSessao()
  const sair = useSair()
  const navegar = useNavigate()
  const itens = ITENS.filter((i) => !i.soAdmin || usuario?.papel === 'admin')

  const encerrar = async () => {
    await sair.mutateAsync().catch(() => undefined)
    navegar('/admin/entrar', { replace: true })
  }

  const estiloLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-gold/10 text-gold' : 'text-paper/65 hover:bg-paper/5 hover:text-paper'
    }`

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-paper/10 bg-coal px-4 py-6 lg:flex">
        <Link to="/admin" className="mb-10 flex items-center gap-3 px-2">
          <Logo className="size-9" vivo={false} />
          <span className="font-display text-sm leading-tight">
            Reedificando
            <br />
            <span className="text-gold">Painel</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1">
          {itens.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/admin'} className={estiloLink}>
              <Icone nome={i.icone} />
              {i.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-paper/10 pt-4">
          <a href="/" target="_blank" rel="noreferrer" className={estiloLink({ isActive: false })}>
            <Icone nome="externo" />
            Ver o site
          </a>
          <button type="button" onClick={encerrar} className={`w-full ${estiloLink({ isActive: false })}`}>
            <Icone nome="sair" />
            Sair
          </button>
          <p className="truncate px-3 pt-3 text-xs text-ash">
            {usuario?.nome} · {usuario?.papel === 'admin' ? 'Administrador' : 'Editor'}
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-paper/10 bg-ink/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <Logo className="size-8" vivo={false} />
          <span className="font-display text-sm text-gold">Painel</span>
        </Link>
        <button type="button" onClick={encerrar} className="text-sm text-paper/70">
          Sair
        </button>
      </header>

      <main className="px-4 pt-6 pb-28 sm:px-8 lg:px-12 lg:py-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-paper/10 bg-coal/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {itens.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] ${isActive ? 'text-gold' : 'text-paper/55'}`
            }
          >
            <Icone nome={i.icone} />
            {i.rotulo}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
