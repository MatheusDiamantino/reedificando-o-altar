import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { RevealText } from '@/components/ui/RevealText'
import { TorchReveal } from '@/components/ui/TorchReveal'
import { Eyebrow, glow } from '@/components/ui/Typography'
import { srcSet } from '@/lib/imagens'
import { useConteudo } from '@/lib/queries'

const PILARES = ['Amor', 'Fé', 'Palavra', 'Comunhão']

export function Welcome() {
  const { data: c } = useConteudo()
  const foto = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: foto, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  return (
    <section className="relative py-28 sm:py-40">
      <TorchReveal
        className="mx-auto mb-28 max-w-7xl cursor-crosshair px-4 select-none sm:mb-40 sm:px-8"
        raio={220}
        revelado={
          <div
            className={`flex flex-wrap justify-center gap-x-10 px-4 font-display text-[clamp(3rem,10vw,8.5rem)] leading-[1.05] font-black text-gold sm:px-8 ${glow}`}
          >
            {PILARES.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        }
      >
        <div
          className="flex flex-wrap justify-center gap-x-10 font-display text-[clamp(3rem,10vw,8.5rem)] leading-[1.05] font-black text-transparent"
          style={{ WebkitTextStroke: '1px rgb(255 255 255 / 0.14)' }}
        >
          {PILARES.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </TorchReveal>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-2 lg:gap-24">
        <div
          ref={foto}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]"
        >
          <motion.img
            src="/img/sobre.webp"
            srcSet={srcSet('/img/sobre.webp')}
            sizes="(max-width: 1024px) 100vw, 50vw"
            alt="Igreja em adoração, com as mãos levantadas"
            className="absolute inset-0 h-[124%] w-full object-cover grayscale"
            style={{ y, top: '-12%' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gold/45 mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <p className="absolute bottom-6 left-6 font-display text-sm tracking-[0.3em] text-paper/80 uppercase">
            Barueri · SP
          </p>
        </div>

        <div>
          <Eyebrow className="mb-6">Bem-vindos</Eyebrow>
          <RevealText
            as="h2"
            texto="Uma casa para a sua vida no altar de Deus."
            className="font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.08] font-bold"
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-8 space-y-5 text-lg leading-relaxed text-paper/70"
          >
            {c?.textos.boas_vindas.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </motion.div>
          <div className="mt-10">
            <MagneticButton to="/sobre" variante="contorno">
              Conheça o ministério
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
