import { useCallback, useState } from 'react'
import { diaDaSemana, diasNoMes, DIAS_CURTOS, hojeIso, isoDe, MESES } from '@/lib/datas'
import { formatarHora } from '@/lib/horarios'
import { useEventosPeriodo } from '@/lib/queries'
import type { Evento } from '@/lib/types'
import { useEventosAdmin, useSalvarEvento } from '../../dados'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Cabecalho } from '../../ui/Cabecalho'
import { Gaveta } from '../../ui/Gaveta'
import { Icone } from '../../ui/Icone'
import { EventoForm } from './EventoForm'

type Edicao = { evento: Evento | null; data: string } | null

export function AgendaAdminPage() {
  const hoje = hojeIso()
  const [ano, setAno] = useState(Number(hoje.slice(0, 4)))
  const [mes, setMes] = useState(Number(hoje.slice(5, 7)) - 1)
  const [edicao, setEdicao] = useState<Edicao>(null)
  const [alvo, setAlvo] = useState<string | null>(null)

  const total = diasNoMes(ano, mes)
  const { data: ocorrencias = [] } = useEventosPeriodo(isoDe(ano, mes, 1), isoDe(ano, mes, total))
  const { data: cadastrados = [] } = useEventosAdmin()
  const salvar = useSalvarEvento()

  const porDia = ocorrencias.reduce<Record<string, Evento[]>>((mapa, e) => {
    ;(mapa[e.data] ??= []).push(e)
    return mapa
  }, {})

  const navegar = (passo: number) => {
    const novo = mes + passo
    setAno(ano + Math.floor(novo / 12))
    setMes(((novo % 12) + 12) % 12)
  }

  const abrir = (id: number | null, data: string) =>
    setEdicao({ evento: cadastrados.find((c) => c.id === id) ?? null, data })

  const mover = async (id: number, data: string) => {
    const base = cadastrados.find((c) => c.id === id)
    if (!base || base.data === data) return
    try {
      await salvar.mutateAsync({ ...base, data })
      avisar(`“${base.titulo}” movido.`)
    } catch (e) {
      avisarErro(e)
    }
  }

  const fechar = useCallback(() => setEdicao(null), [])

  return (
    <>
      <Cabecalho
        titulo="Agenda"
        descricao="Clique num dia para criar um evento. No computador, arraste um evento para mudar o dia."
        acao={
          <Botao onClick={() => setEdicao({ evento: null, data: hoje })}>
            <Icone nome="mais" /> Novo evento
          </Botao>
        }
      />

      <div className="rounded-2xl border border-paper/10 bg-coal p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            {MESES[mes]} <span className="text-paper/40">{ano}</span>
          </h2>
          <div className="flex gap-2">
            <Botao variante="contorno" onClick={() => navegar(-1)} aria-label="Mês anterior">
              ←
            </Botao>
            <Botao
              variante="fantasma"
              onClick={() => {
                setAno(Number(hoje.slice(0, 4)))
                setMes(Number(hoje.slice(5, 7)) - 1)
              }}
            >
              Hoje
            </Botao>
            <Botao variante="contorno" onClick={() => navegar(1)} aria-label="Próximo mês">
              →
            </Botao>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-[0.15em] text-ash uppercase">
          {DIAS_CURTOS.map((d) => (
            <span key={d} className="pb-2">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: diaDaSemana(isoDe(ano, mes, 1)) }, (_, i) => (
            <span key={`v${i}`} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const iso = isoDe(ano, mes, i + 1)
            const doDia = porDia[iso] ?? []
            return (
              <div
                key={iso}
                role="button"
                tabIndex={0}
                onClick={() => abrir(null, iso)}
                onKeyDown={(e) => e.key === 'Enter' && abrir(null, iso)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setAlvo(iso)
                }}
                onDragLeave={() => setAlvo((a) => (a === iso ? null : a))}
                onDrop={(e) => {
                  e.preventDefault()
                  setAlvo(null)
                  mover(Number(e.dataTransfer.getData('text/plain')), iso)
                }}
                className={`min-h-20 cursor-pointer rounded-lg border p-1.5 text-left transition sm:min-h-28 ${
                  alvo === iso ? 'border-gold bg-gold/10' : 'border-paper/5 hover:border-paper/20'
                } ${iso === hoje ? 'ring-1 ring-gold/60' : ''}`}
              >
                <span className={`text-xs ${iso === hoje ? 'font-bold text-gold' : 'text-paper/50'}`}>{i + 1}</span>
                <div className="mt-1 space-y-1">
                  {doDia.map((e) => {
                    const repete = !!e.recorrencia
                    return (
                      <button
                        key={`${e.id}-${e.data}`}
                        type="button"
                        draggable={!repete}
                        onDragStart={(ev) => ev.dataTransfer.setData('text/plain', String(e.id))}
                        onClick={(ev) => {
                          ev.stopPropagation()
                          abrir(e.id, e.data)
                        }}
                        title={repete ? 'Evento que se repete: edite para mudar a data' : 'Arraste para mudar o dia'}
                        className={`flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-left text-[11px] leading-tight font-medium sm:text-xs ${
                          repete
                            ? 'bg-paper/10 text-paper/80'
                            : 'cursor-grab bg-gold/90 text-ink active:cursor-grabbing'
                        }`}
                      >
                        {repete && <Icone nome="repete" className="size-3 shrink-0" />}
                        <span className="hidden truncate sm:inline">
                          {e.hora && `${formatarHora(e.hora.slice(0, 5))} `}
                          {e.titulo}
                        </span>
                        <span className="truncate sm:hidden">{e.titulo}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <section className="mt-6 lg:hidden">
        <h2 className="mb-3 text-xs font-semibold tracking-[0.15em] text-paper/50 uppercase">Neste mês</h2>
        {ocorrencias.length === 0 ? (
          <p className="text-paper/60">Nenhum evento.</p>
        ) : (
          <ul className="space-y-2">
            {ocorrencias.map((e) => (
              <li key={`${e.id}-${e.data}`}>
                <button
                  type="button"
                  onClick={() => abrir(e.id, e.data)}
                  className="flex w-full items-center gap-4 rounded-xl border border-paper/10 bg-coal p-3 text-left"
                >
                  <span className="w-10 text-center font-display text-xl font-bold text-gold">{e.data.slice(8)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.titulo}</span>
                    <span className="flex items-center gap-1 text-xs text-ash">
                      {e.recorrencia && <Icone nome="repete" className="size-3" />}
                      {e.hora ? formatarHora(e.hora.slice(0, 5)) : 'Dia todo'}
                      {e.local && ` · ${e.local}`}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Gaveta aberta={!!edicao} titulo={edicao?.evento ? 'Editar evento' : 'Novo evento'} aoFechar={fechar}>
        {edicao && (
          <EventoForm
            key={edicao.evento?.id ?? edicao.data}
            evento={edicao.evento}
            dataInicial={edicao.data}
            aoSalvar={fechar}
          />
        )}
      </Gaveta>
    </>
  )
}
