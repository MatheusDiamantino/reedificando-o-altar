import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { PageHero } from '@/components/ui/PageHero'
import { RevealText } from '@/components/ui/RevealText'
import { ScrollHighlight } from '@/components/ui/ScrollHighlight'
import { TiltCard } from '@/components/ui/TiltCard'
import { Eyebrow, GoldText } from '@/components/ui/Typography'
import { usePageMeta } from '@/hooks/usePageMeta'
import { srcSet } from '@/lib/imagens'
import { useConteudo } from '@/lib/queries'
import { SEO } from '@/lib/seo'
import type { Conteudo } from '@/lib/types'

export function SobrePage() {
  usePageMeta(SEO['/sobre'])
  const { data: c } = useConteudo()
  if (!c) return null

  return (
    <>
      <PageHero
        eyebrow="Sobre o ministério"
        titulo="Sua vida no altar de Deus."
        subtitulo="Somos uma igreja em Barueri que existe para reedificar altares: vidas entregues, restauradas e acesas pela presença de Deus."
        imagem="/img/banner.webp"
      />
      <Chamado c={c} />
      <Amos c={c} />
      <Lideres c={c} />
      {c.historia.length > 0 && <Historia c={c} />}
      <section className="py-28 text-center sm:py-36">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-[clamp(2rem,5vw,3.8rem)] leading-tight font-bold">
            Faça parte desta <GoldText>família.</GoldText>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MagneticButton to="/visite">Visite-nos</MagneticButton>
            <MagneticButton href={c.redes.facebook_grupo} variante="contorno">
              Grupo no Facebook
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}

function Chamado({ c }: { c: Conteudo }) {
  const { chamado } = c.textos
  return (
    <section className="relative py-28 sm:py-40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow className="mb-6">{chamado.pergunta}</Eyebrow>
          <RevealText
            as="h2"
            texto={chamado.titulo}
            className="font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold"
          />
          <p className="mt-6 font-display text-2xl text-gold">{chamado.subtitulo}</p>
        </div>
        <div className="space-y-8 text-xl leading-relaxed text-paper/75 sm:text-2xl">
          {chamado.texto
            .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)
            .reduce<string[][]>((grupos, frase, i) => {
              if (i % 2 === 0) grupos.push([frase])
              else grupos[grupos.length - 1].push(frase)
              return grupos
            }, [])
            .map((grupo, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="border-l border-gold/30 pl-6"
              >
                {grupo.join(' ')}
              </motion.p>
            ))}
        </div>
      </div>
    </section>
  )
}

function Amos({ c }: { c: Conteudo }) {
  const { amos_9_11 } = c.textos
  return (
    <section className="relative overflow-hidden bg-coal py-32 sm:py-48">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[90vmax] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_208_0/0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <Eyebrow className="mb-10">{amos_9_11.referencia}</Eyebrow>
        <ScrollHighlight
          texto={amos_9_11.texto}
          className="font-display text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[1.2] font-semibold"
        />
      </div>
    </section>
  )
}

function Lideres({ c }: { c: Conteudo }) {
  if (c.lideres.length === 0) return null
  return (
    <section className="py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-16 max-w-2xl">
          <Eyebrow className="mb-5">Liderança</Eyebrow>
          <RevealText
            as="h2"
            texto="Servos que cuidam do altar."
            className="font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
          />
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3">
          {c.lideres.map((l, i) => (
            <motion.li
              key={l.nome}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: (i % 3) * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard className="overflow-hidden rounded-[1.75rem] bg-coal">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={l.foto}
                    srcSet={srcSet(l.foto)}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    alt={`${l.cargo} ${l.nome}`}
                    loading="lazy"
                    className="size-full object-cover brightness-90 contrast-110 grayscale transition duration-700 ease-altar group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gold/45 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" />
                  <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 [transform:translateZ(40px)] p-4 sm:p-6">
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-gold uppercase sm:text-xs">{l.cargo}</p>
                  <p className="mt-1 font-display text-xl font-semibold sm:text-3xl">{l.nome}</p>
                </div>
              </TiltCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Historia({ c }: { c: Conteudo }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.5'] })
  const altura = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="bg-coal py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <Eyebrow className="mb-5">Nossa história</Eyebrow>
        <RevealText
          as="h2"
          texto="Pedra sobre pedra."
          className="mb-16 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
        />
        <ol ref={ref} className="relative space-y-14 pl-10">
          <span className="absolute top-0 bottom-0 left-[7px] w-px bg-paper/10" />
          <motion.span
            className="absolute top-0 left-[7px] w-px bg-gold shadow-[0_0_12px_rgb(255_208_0/0.8)]"
            style={{ height: altura }}
          />
          {c.historia.map((m) => (
            <motion.li
              key={m.ano + m.titulo}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <span className="absolute top-2 -left-10 size-[15px] rotate-45 border border-gold bg-ink" />
              <p className="font-display text-4xl font-bold text-gold">{m.ano}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{m.titulo}</h3>
              {m.texto && <p className="mt-3 text-paper/70">{m.texto}</p>}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
