import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { RevealText } from '@/components/ui/RevealText'
import { Eyebrow } from '@/components/ui/Typography'
import { partesDaData } from '@/lib/datas'
import { formatarHora } from '@/lib/horarios'
import type { Evento } from '@/lib/types'

export function Trilha({ eventos }: { eventos: Evento[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] })
  const altura = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="relative overflow-hidden bg-coal py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mb-20 text-center">
          <Eyebrow className="mb-5">Próximos eventos</Eyebrow>
          <RevealText
            as="h2"
            texto="Separe a data."
            className="font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
          />
        </div>

        {eventos.length === 0 ? (
          <p className="text-center text-paper/60">Nenhum evento especial marcado para os próximos meses.</p>
        ) : (
          <ol ref={ref} className="relative space-y-16 md:space-y-24">
            <span className="absolute top-0 bottom-0 left-[27px] w-px bg-paper/10 md:left-1/2" />
            <motion.span
              className="absolute top-0 left-[27px] w-px bg-gold shadow-[0_0_14px_rgb(255_208_0/0.9)] md:left-1/2"
              style={{ height: altura }}
            />
            {eventos.map((e, i) => {
              const d = partesDaData(e.data)
              const direita = i % 2 === 1
              return (
                <li
                  key={`${e.id}-${e.data}`}
                  className="relative grid grid-cols-[56px_1fr] gap-6 md:grid-cols-2 md:gap-36"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className="relative z-10 flex size-14 flex-col items-center justify-center rounded-[1rem_0.7rem_1.1rem_0.6rem] border border-gold/60 bg-linear-to-br from-[#3a332a] to-[#1c1a17] shadow-[0_0_30px_rgb(255_208_0/0.35)] md:absolute md:top-0 md:left-1/2 md:size-20 md:-translate-x-1/2"
                  >
                    <span className="font-display text-xl leading-none font-bold text-gold md:text-3xl">{d.dia}</span>
                    <span className="text-[9px] tracking-[0.2em] text-paper/70 uppercase md:text-[11px]">{d.mes}</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: direita ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-25% 0px' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`md:pt-3 ${direita ? 'md:col-start-2' : 'md:col-start-1 md:text-right'}`}
                  >
                    <p className="text-xs tracking-[0.2em] text-ash uppercase">
                      {d.semana}
                      {e.hora && ` · ${formatarHora(e.hora.slice(0, 5))}`}
                      {e.local && ` · ${e.local}`}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{e.titulo}</h3>
                    {e.descricao && <p className="mt-3 text-paper/60">{e.descricao}</p>}
                  </motion.div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}
