import { gsap } from 'gsap'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { capaDaLive, dataLonga } from '@/lib/lives'
import type { Live } from '@/lib/types'

type Props = { lives: Live[]; aoAbrir: (live: Live) => void }

export function GaleriaCinema({ lives, aoAbrir }: Props) {
  const secao = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLUListElement>(null)
  const barra = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const el = trilho.current
      if (!el || !secao.current) return
      const distancia = () => Math.max(0, el.scrollWidth - window.innerWidth)
      gsap.to(el, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: secao.current,
          start: 'top top',
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => barra.current?.style.setProperty('transform', `scaleX(${self.progress})`),
        },
      })
    })
    return () => mm.revert()
  }, [lives.length])

  return (
    <div ref={secao} className="lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden">
      <ul
        ref={trilho}
        className="mt-12 grid gap-6 px-4 sm:grid-cols-2 sm:px-8 lg:mt-0 lg:flex lg:w-max lg:gap-10 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {lives.map((live, i) => (
          <motion.li
            key={live.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 0.7, delay: Math.min(i, 4) * 0.08 }}
            className="lg:w-[min(42vw,640px)] lg:shrink-0"
          >
            <button type="button" onClick={() => aoAbrir(live)} className="group block w-full text-left">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-coal">
                <img
                  src={capaDaLive(live)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition duration-700 ease-altar group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-paper/10 transition duration-500 ring-inset group-hover:shadow-[inset_0_0_80px_rgb(255_208_0/0.3)] group-hover:ring-gold/60" />
                <span className="absolute top-5 left-5 font-display text-5xl leading-none font-black text-paper/15 transition-colors duration-500 group-hover:text-gold/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="absolute right-5 bottom-5 grid size-14 scale-75 place-items-center rounded-full bg-gold text-ink opacity-0 shadow-[0_0_50px_rgb(255_208_0/0.6)] transition duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" className="ml-0.5 size-6" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
              <p className="mt-5 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
                {live.ao_vivo ? 'Ao vivo · ' : ''}
                {dataLonga(live.data_live)}
              </p>
              <h2 className="mt-2 font-display text-2xl leading-snug font-semibold transition-colors group-hover:text-gold">
                {live.titulo}
              </h2>
              {live.descricao && <p className="mt-2 line-clamp-2 text-paper/60">{live.descricao}</p>}
            </button>
          </motion.li>
        ))}
      </ul>
      <div className="mx-auto mt-14 hidden h-px w-full max-w-7xl bg-paper/10 px-8 lg:block">
        <span ref={barra} className="block h-px origin-left scale-x-0 bg-gold shadow-[0_0_10px_rgb(255_208_0/0.8)]" />
      </div>
    </div>
  )
}
