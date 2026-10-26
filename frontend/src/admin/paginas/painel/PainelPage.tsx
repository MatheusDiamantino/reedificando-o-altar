import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { partesDaData } from '@/lib/datas'
import { dataLonga } from '@/lib/lives'
import { plural } from '@/lib/texto'
import { useResumo } from '../../dados'
import { useSessao } from '../../sessao'
import { Icone } from '../../ui/Icone'

function saudacao() {
  const hora = Number(
    new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }),
  )
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function PainelPage() {
  const { data: usuario } = useSessao()
  const { data: r } = useResumo()
  const admin = usuario?.papel === 'admin'
  const naoLidas = (r?.mensagens_nao_lidas.contato ?? 0) + (r?.mensagens_nao_lidas.oracao ?? 0)

  return (
    <>
      <p className="text-paper/60">{saudacao()},</p>
      <h1 className="mb-10 font-display text-4xl font-bold">{usuario?.nome.split(' ')[0]}</h1>

      <Link
        to="/admin/lives?nova=1"
        className="group relative mb-8 flex items-center justify-between overflow-hidden rounded-2xl bg-gold p-6 text-ink sm:p-8"
      >
        <span>
          <span className="block font-display text-2xl font-bold sm:text-3xl">Publicar nova live</span>
          <span className="mt-1 block text-ink/70">Cole o link do YouTube e pronto.</span>
        </span>
        <span className="grid size-14 place-items-center rounded-full bg-ink text-gold transition group-hover:scale-110">
          <Icone nome="mais" className="size-7" />
        </span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {admin && (
          <Cartao to="/admin/mensagens" rotulo="Mensagens novas" valor={String(naoLidas)}>
            {r
              ? `${plural(r.mensagens_nao_lidas.oracao, 'pedido de oração', 'pedidos de oração')} · ${plural(r.mensagens_nao_lidas.contato, 'contato', 'contatos')}`
              : '…'}
          </Cartao>
        )}
        <Cartao to="/admin/lives" rotulo="Lives publicadas" valor={String(r?.total_lives ?? '…')}>
          {r?.ultima_live ? `Última: ${dataLonga(r.ultima_live.data_live)}` : 'Nenhuma ainda'}
        </Cartao>
        <Cartao
          to="/admin/agenda"
          rotulo="Próximo evento"
          valor={
            r?.proximo_evento
              ? `${partesDaData(r.proximo_evento.data).dia} ${partesDaData(r.proximo_evento.data).mes}`
              : '—'
          }
        >
          {r?.proximo_evento?.titulo ?? 'Nada marcado'}
        </Cartao>
        <Cartao to="/admin/lives" rotulo="Última live" valor={r?.ultima_live ? '▶' : '—'}>
          <span className="line-clamp-2">{r?.ultima_live?.titulo ?? 'Nenhuma ainda'}</span>
        </Cartao>
      </div>
    </>
  )
}

function Cartao({ to, rotulo, valor, children }: { to: string; rotulo: string; valor: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-paper/10 bg-coal p-6 transition hover:-translate-y-0.5 hover:border-gold/40"
    >
      <p className="text-xs font-semibold tracking-[0.15em] text-paper/50 uppercase">{rotulo}</p>
      <p className="mt-3 font-display text-4xl font-bold text-gold">{valor}</p>
      <p className="mt-2 text-sm text-paper/60">{children}</p>
    </Link>
  )
}
