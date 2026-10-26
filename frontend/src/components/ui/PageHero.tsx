import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { entradaJaAnimada } from '@/lib/ambiente'
import { srcSet } from '@/lib/imagens'
import { RevealText } from './RevealText'
import { Eyebrow } from './Typography'

type Props = {
  eyebrow: string
  titulo: string
  subtitulo?: string
  imagem: string
  children?: ReactNode
}

export function PageHero({ eyebrow, titulo, subtitulo, imagem, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [semAnimacao] = useState(entradaJaAnimada)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const escala = useTransform(scrollYProgress, [0, 1], [1.05, 1.2])
  const opacidade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative flex min-h-[78svh] items-end overflow-hidden pt-28 pb-16 sm:pb-24">
      <motion.div className="absolute inset-0" style={{ y, scale: escala }}>
        <img
          src={imagem}
          srcSet={srcSet(imagem)}
          sizes="100vw"
          alt=""
          className="size-full object-cover grayscale"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gold/45 mix-blend-color" />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgb(255_208_0/0.18),transparent_60%)]" />

      <motion.div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8" style={{ opacity: opacidade }}>
        <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
        <RevealText
          as="h1"
          imediato
          texto={titulo}
          className="max-w-5xl font-display text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.98] font-bold"
        />
        {subtitulo && (
          <p
            className={`mt-8 max-w-xl text-lg text-paper/70 ${semAnimacao ? '' : 'animate-surgir [animation-delay:0.6s] motion-reduce:animate-none'}`}
          >
            {subtitulo}
          </p>
        )}
        {children}
      </motion.div>
    </section>
  )
}
