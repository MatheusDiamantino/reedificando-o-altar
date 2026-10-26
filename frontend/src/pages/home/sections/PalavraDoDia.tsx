import { motion } from 'motion/react'
import { Eyebrow, glow } from '@/components/ui/Typography'
import { doDia, VERSICULOS_DO_DIA } from '@/lib/versiculos'

export function PalavraDoDia() {
  const versiculo = doDia(VERSICULOS_DO_DIA)

  return (
    <section className="relative px-4 py-24 sm:py-32" aria-label="Palavra de hoje">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-px max-w-5xl bg-linear-to-r from-transparent via-gold/25 to-transparent" />
      <motion.figure
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl bg-ink px-2 py-6 text-center sm:px-10"
      >
        <Eyebrow className="mb-6">Palavra de hoje</Eyebrow>
        <blockquote className={`font-display text-[clamp(1.5rem,3.4vw,2.6rem)] leading-snug ${glow}`}>
          “{versiculo.texto}”
        </blockquote>
        <figcaption className="mt-6 text-sm font-semibold tracking-[0.25em] text-gold uppercase">
          {versiculo.referencia}
        </figcaption>
      </motion.figure>
    </section>
  )
}
