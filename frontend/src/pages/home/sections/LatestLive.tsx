import { motion } from 'motion/react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { RevealText } from '@/components/ui/RevealText'
import { Eyebrow } from '@/components/ui/Typography'
import { useLives } from '@/lib/queries'
import { capaDaLive, dataLonga } from '@/lib/lives'
import type { Live } from '@/lib/types'

export function LatestLive() {
  const { data: lives, isError } = useLives(4)
  const [destaque, ...outras] = lives ?? []

  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-5">Cultos e lives</Eyebrow>
            <RevealText
              as="h2"
              texto="A Palavra chega até você."
              className="font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
            />
          </div>
          <MagneticButton to="/lives" variante="contorno">
            Todas as lives
          </MagneticButton>
        </div>

        {destaque ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <CartaoLive live={destaque} grande />
            <div className="grid gap-6">
              {outras.slice(0, 2).map((l) => (
                <CartaoLive key={l.id} live={l} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid aspect-[21/9] place-items-center rounded-[2rem] border border-paper/10 bg-coal text-center text-paper/60">
            <p className="max-w-sm px-6">
              {isError
                ? 'Não conseguimos carregar as lives agora.'
                : lives
                  ? 'As lives aparecem aqui assim que forem publicadas.'
                  : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function CartaoLive({ live, grande = false }: { live: Live; grande?: boolean }) {
  return (
    <motion.a
      href={live.link}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative block overflow-hidden rounded-[2rem] bg-coal ${grande ? 'aspect-video lg:aspect-auto lg:min-h-[480px]' : 'aspect-video'}`}
    >
      <img
        src={capaDaLive(live)}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition duration-700 ease-altar group-hover:scale-105 group-hover:brightness-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-paper/10 transition duration-500 ring-inset group-hover:shadow-[inset_0_0_80px_rgb(255_208_0/0.25)] group-hover:ring-gold/60" />

      <span className="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 scale-90 place-items-center rounded-full bg-gold text-ink opacity-0 shadow-[0_0_60px_rgb(255_208_0/0.6)] transition duration-500 group-hover:scale-100 group-hover:opacity-100 sm:size-20">
        <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="mb-2 flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          {live.ao_vivo && <span className="rounded-full bg-ember px-2 py-0.5 text-ink">Ao vivo</span>}
          {dataLonga(live.data_live)}
        </p>
        <h3 className={`font-display leading-tight font-semibold ${grande ? 'text-2xl sm:text-4xl' : 'text-xl'}`}>
          {live.titulo}
        </h3>
        {grande && live.descricao && <p className="mt-3 line-clamp-2 max-w-xl text-paper/70">{live.descricao}</p>}
      </div>
    </motion.a>
  )
}
