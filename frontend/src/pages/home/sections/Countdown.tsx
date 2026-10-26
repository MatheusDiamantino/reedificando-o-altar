import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow, GoldText } from '@/components/ui/Typography'
import { formatarHora, NOME_DIA, proximoCulto } from '@/lib/horarios'
import { useConteudo, useLiveAtual } from '@/lib/queries'

function partes(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [
    { valor: Math.floor(s / 86400), rotulo: 'dias' },
    { valor: Math.floor((s % 86400) / 3600), rotulo: 'horas' },
    { valor: Math.floor((s % 3600) / 60), rotulo: 'min' },
    { valor: s % 60, rotulo: 'seg' },
  ]
}

function Digito({ valor }: { valor: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.72em] overflow-hidden align-top">
      <AnimatePresence initial={false}>
        <motion.span
          key={valor}
          className="absolute inset-0 text-center"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
        >
          {valor}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Countdown() {
  const { data: c } = useConteudo()
  const { data: live } = useLiveAtual()
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const proximo = c ? proximoCulto(c.horarios, agora) : null
  if (!c || !proximo) return null
  const { horario, inicio, acontecendoAgora } = proximo

  return (
    <section className="relative overflow-hidden border-y border-paper/10 bg-coal py-24 sm:py-32">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[60vmax] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_208_0/0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-8">
        {acontecendoAgora ? (
          <>
            <Eyebrow className="mb-6">Acontecendo agora</Eyebrow>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] leading-none font-bold">
              O culto <GoldText>começou.</GoldText>
            </h2>
            <p className="mt-6 text-paper/70">
              {horario.nome}, até {formatarHora(horario.fim)}. Ainda dá tempo de chegar.
            </p>
          </>
        ) : (
          <>
            <Eyebrow className="mb-6">Próximo culto em</Eyebrow>
            <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 font-display text-[clamp(3.5rem,11vw,9rem)] leading-none font-bold sm:gap-x-12">
              {partes(inicio.getTime() - agora.getTime()).map(({ valor, rotulo }) => (
                <div key={rotulo} className="flex flex-col items-center">
                  <span className="tabular-nums">
                    {String(valor)
                      .padStart(2, '0')
                      .split('')
                      .map((d, i) => (
                        <Digito key={i} valor={d} />
                      ))}
                  </span>
                  <span className="mt-3 font-sans text-xs font-semibold tracking-[0.35em] text-ash uppercase">
                    {rotulo}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-lg text-paper/80">
              {NOME_DIA[horario.dia]}, das {formatarHora(horario.inicio)} às {formatarHora(horario.fim)} ·{' '}
              <span className="text-gold">{horario.nome}</span>
            </p>
          </>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <MagneticButton to="/visite">Como chegar</MagneticButton>
          {live && (
            <MagneticButton href={live.link} variante="contorno">
              Assistir ao vivo
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  )
}
