import { motion } from 'motion/react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { RevealText } from '@/components/ui/RevealText'
import { Eyebrow } from '@/components/ui/Typography'
import { formatarHora } from '@/lib/horarios'
import { useEventos } from '@/lib/queries'

const partesData = (iso: string) => {
  const d = new Date(`${iso}T12:00:00-03:00`)
  return {
    dia: d.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'America/Sao_Paulo' }),
    mes: d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' }).replace('.', ''),
    semana: d.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' }),
  }
}

export function UpcomingEvents() {
  const { data: eventos } = useEventos(90)
  const proximos = (eventos ?? []).filter((e, i, todos) => todos.findIndex((o) => o.id === e.id) === i).slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-coal py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-5">Agenda</Eyebrow>
            <RevealText
              as="h2"
              texto="O caminho, pedra por pedra."
              className="font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
            />
          </div>
          <MagneticButton to="/agenda" variante="contorno">
            Ver agenda completa
          </MagneticButton>
        </div>

        {proximos.length === 0 ? (
          <p className="text-paper/60">Nenhum evento marcado para os próximos meses. Fique de olho!</p>
        ) : (
          <ol className="relative grid gap-6 md:grid-cols-4">
            <span
              aria-hidden
              className="absolute top-11 right-0 left-0 hidden h-px bg-linear-to-r from-gold/0 via-gold/50 to-gold/0 md:block"
            />
            {proximos.map((e, i) => {
              const { dia, mes, semana } = partesData(e.data)
              return (
                <motion.li
                  key={`${e.id}-${e.data}`}
                  initial={{ opacity: 0, y: 50, rotate: -4 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative"
                >
                  <div className="relative z-10 mb-6 flex size-22 flex-col items-center justify-center rounded-[1.4rem_1rem_1.6rem_0.9rem] border border-paper/10 bg-linear-to-br from-[#3a332a] to-[#1c1a17] shadow-[0_20px_40px_rgb(0_0_0/0.5)] transition duration-500 group-hover:-translate-y-2 group-hover:border-gold/70 group-hover:shadow-[0_0_40px_rgb(255_208_0/0.35)]">
                    <span className="font-display text-3xl leading-none font-bold text-gold">{dia}</span>
                    <span className="mt-1 text-[11px] font-semibold tracking-[0.25em] text-paper/70 uppercase">
                      {mes}
                    </span>
                  </div>
                  <p className="mb-1 text-xs tracking-[0.2em] text-ash uppercase">
                    {semana}
                    {e.hora && ` · ${formatarHora(e.hora.slice(0, 5))}`}
                  </p>
                  <h3 className="font-display text-xl leading-snug font-semibold">{e.titulo}</h3>
                  {e.descricao && <p className="mt-2 line-clamp-3 text-sm text-paper/60">{e.descricao}</p>}
                </motion.li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}
