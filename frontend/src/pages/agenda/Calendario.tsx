import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Eyebrow } from '@/components/ui/Typography'
import { diaDaSemana, diasNoMes, DIAS_CURTOS, hojeIso, isoDe, MESES, partesDaData } from '@/lib/datas'
import { formatarHora } from '@/lib/horarios'
import { useEventosPeriodo } from '@/lib/queries'

export function Calendario() {
  const hoje = hojeIso()
  const [ano, setAno] = useState(Number(hoje.slice(0, 4)))
  const [mes, setMes] = useState(Number(hoje.slice(5, 7)) - 1)
  const [direcao, setDirecao] = useState(1)
  const [selecionado, setSelecionado] = useState<string | null>(null)

  const total = diasNoMes(ano, mes)
  const inicio = isoDe(ano, mes, 1)
  const fim = isoDe(ano, mes, total)
  const { data: eventos = [] } = useEventosPeriodo(inicio, fim)
  const porDia = eventos.reduce<Record<string, typeof eventos>>((mapa, e) => {
    ;(mapa[e.data] ??= []).push(e)
    return mapa
  }, {})
  const vazios = diaDaSemana(inicio)

  const navegar = (passo: number) => {
    setDirecao(passo)
    setSelecionado(null)
    const novo = mes + passo
    setAno(ano + Math.floor(novo / 12))
    setMes(((novo % 12) + 12) % 12)
  }

  const doDia = selecionado ? (porDia[selecionado] ?? []) : []

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Eyebrow className="mb-2">Calendário</Eyebrow>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={`${ano}-${mes}`}
                  initial={{ opacity: 0, x: 30 * direcao }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 * direcao }}
                  className="font-display text-4xl font-bold sm:text-5xl"
                >
                  {MESES[mes]} <span className="text-paper/50">{ano}</span>
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              {[
                { passo: -1, rotulo: 'Mês anterior', seta: '←' },
                { passo: 1, rotulo: 'Próximo mês', seta: '→' },
              ].map((b) => (
                <button
                  key={b.passo}
                  type="button"
                  onClick={() => navegar(b.passo)}
                  aria-label={b.rotulo}
                  className="grid size-12 place-items-center rounded-full border border-paper/20 text-lg transition hover:border-gold hover:bg-gold hover:text-ink"
                >
                  {b.seta}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] tracking-[0.2em] text-ash uppercase sm:gap-2">
            {DIAS_CURTOS.map((d) => (
              <span key={d} className="pb-2">
                {d}
              </span>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${ano}-${mes}`}
              initial={{ opacity: 0, x: 40 * direcao }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direcao }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-7 gap-1.5 sm:gap-2"
            >
              {Array.from({ length: vazios }, (_, i) => (
                <span key={`v${i}`} />
              ))}
              {Array.from({ length: total }, (_, i) => {
                const iso = isoDe(ano, mes, i + 1)
                const temEvento = !!porDia[iso]?.length
                const ativo = selecionado === iso
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={!temEvento}
                    onClick={() => setSelecionado(ativo ? null : iso)}
                    className={`relative h-11 rounded-xl text-sm transition sm:h-14 sm:text-base ${
                      ativo
                        ? 'bg-gold font-bold text-ink shadow-[0_0_30px_rgb(255_208_0/0.6)]'
                        : temEvento
                          ? 'border border-gold/50 bg-gold/10 font-semibold text-gold hover:bg-gold/25'
                          : 'text-paper/40'
                    } ${iso === hoje && !ativo ? 'ring-1 ring-paper/60' : ''}`}
                  >
                    {i + 1}
                    {temEvento && !ativo && (
                      <span className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_rgb(255_208_0)]" />
                    )}
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="rounded-[1.75rem] border border-paper/10 bg-coal p-8 lg:mt-24">
          {selecionado ? (
            <>
              <p className="font-display text-3xl font-bold text-gold">
                {partesDaData(selecionado).dia} de {partesDaData(selecionado).mesLongo}
              </p>
              <p className="mb-6 text-sm tracking-[0.2em] text-ash uppercase">{partesDaData(selecionado).semana}</p>
              <ul className="space-y-6">
                {doDia.map((e) => (
                  <li key={`${e.id}-${e.data}`} className="border-l border-gold/40 pl-5">
                    <p className="text-xs tracking-[0.2em] text-gold uppercase">
                      {e.hora ? formatarHora(e.hora.slice(0, 5)) : 'Dia todo'}
                      {e.local && ` · ${e.local}`}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold">{e.titulo}</p>
                    {e.descricao && <p className="mt-2 text-paper/60">{e.descricao}</p>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex h-full min-h-48 flex-col justify-center text-paper/60">
              <p className="font-display text-2xl text-paper">Toque num dia dourado.</p>
              <p className="mt-2">
                {eventos.length > 0
                  ? `${eventos.length} ${eventos.length === 1 ? 'evento' : 'eventos'} em ${MESES[mes].toLowerCase()}.`
                  : `Nenhum evento em ${MESES[mes].toLowerCase()}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
