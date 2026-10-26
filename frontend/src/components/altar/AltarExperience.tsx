import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { useLenis } from '@/hooks/useLenis'
import { useQuadroVisivel } from '@/hooks/useQuadroVisivel'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow, glow, GoldText } from '@/components/ui/Typography'
import Altar2D from './Altar2D'
import {
  clamp01,
  FOGO_ACESO,
  FOGO_DESCE,
  IMPACTO,
  janelaDaPedra,
  opacidadeNaFaixa,
  PEDRAS,
  pedrasColocadas,
  suave,
  type Faixa,
} from './timeline'

const AltarCanvas = lazy(() => import('./AltarCanvas'))

function aparecer(el: HTMLElement | null, opacidade: number) {
  if (!el) return
  el.style.opacity = String(opacidade)
  el.style.transform = `translateY(${(1 - opacidade) * 24}px)`
  el.style.pointerEvents = opacidade > 0.5 ? 'auto' : 'none'
  el.style.visibility = opacidade < 0.001 ? 'hidden' : 'visible'
}

function quandoOcioso(tarefa: () => void) {
  const ocioso = window.requestIdleCallback
  if (ocioso) {
    const id = ocioso(tarefa, { timeout: 3000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(tarefa, 300)
  return () => window.clearTimeout(id)
}

const CAPITULOS: { faixa: Faixa; texto: string; referencia?: string }[] = [
  {
    faixa: [0.13, 0.33],
    texto: 'E Elias tomou doze pedras, conforme ao número das tribos dos filhos de Jacó.',
    referencia: '1 Reis 18:31',
  },
  {
    faixa: [0.37, 0.56],
    texto: 'E com aquelas pedras edificou o altar em nome do Senhor.',
    referencia: '1 Reis 18:32',
  },
  {
    faixa: [0.6, 0.74],
    texto: 'Pedra sobre pedra, Deus reconstrói o que estava em ruínas.',
  },
  {
    faixa: [0.79, 0.86],
    texto: 'Então caiu fogo do Senhor.',
    referencia: '1 Reis 18:38',
  },
]

const VERSICULO_FINAL = 'Naquele dia, restaurarei a tenda caída de Davi e consertarei seus muros quebrados.'.split(' ')
const FAIXA_FINAL: Faixa = [0.885, 1.2]
const FAIXA_PALAVRAS: Faixa = [0.885, 0.96]

export function AltarExperience() {
  const tier = useDeviceTier()
  const lenis = useLenis()
  const secao = useRef<HTMLElement>(null)
  const progresso = useRef(0)
  const ultimasPedras = useRef(-1)
  const ultimoProgresso = useRef(-1)
  const [cena3d, setCena3d] = useState(false)

  const abertura = useRef<HTMLDivElement>(null)
  const contador = useRef<HTMLDivElement>(null)
  const numeroContador = useRef<HTMLSpanElement>(null)
  const capitulos = useRef<(HTMLDivElement | null)[]>([])
  const marcas = useRef<(HTMLSpanElement | null)[]>([])
  const final = useRef<HTMLDivElement>(null)
  const palavras = useRef<(HTMLSpanElement | null)[]>([])
  const brilho = useRef<HTMLDivElement>(null)
  const clarao = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = secao.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progresso.current = self.progress
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    if (tier !== 'full') return
    let cancelar = () => {}
    const carregar = () => {
      cancelar = quandoOcioso(() => setCena3d(true))
    }
    if (document.readyState === 'complete') carregar()
    else window.addEventListener('load', carregar, { once: true })
    return () => {
      window.removeEventListener('load', carregar)
      cancelar()
    }
  }, [tier])

  useQuadroVisivel(secao, () => {
    const p = progresso.current
    if (p === ultimoProgresso.current) return
    ultimoProgresso.current = p

    aparecer(abertura.current, 1 - suave(0.04, 0.1, p))
    aparecer(contador.current, opacidadeNaFaixa([0.11, 0.8], p, 0.03))
    CAPITULOS.forEach((c, i) => aparecer(capitulos.current[i], opacidadeNaFaixa(c.faixa, p)))
    aparecer(final.current, opacidadeNaFaixa(FAIXA_FINAL, p, 0.02))

    const n = pedrasColocadas(p)
    if (n !== ultimasPedras.current) {
      ultimasPedras.current = n
      if (numeroContador.current) numeroContador.current.textContent = String(n).padStart(2, '0')
      marcas.current.forEach((m, i) => m?.toggleAttribute('data-acesa', i < n))
    }

    const passo = (FAIXA_PALAVRAS[1] - FAIXA_PALAVRAS[0]) / VERSICULO_FINAL.length
    palavras.current.forEach((w, i) => {
      if (!w) return
      const k = clamp01((p - FAIXA_PALAVRAS[0] - i * passo) / (passo * 2))
      w.style.opacity = String(0.12 + k * 0.88)
      w.style.filter = k >= 1 ? 'none' : `blur(${(1 - k) * 6}px)`
    })

    const fogo = suave(FOGO_DESCE, FOGO_ACESO, p)
    if (brilho.current) brilho.current.style.opacity = String(fogo)
    if (clarao.current)
      clarao.current.style.opacity = String(opacidadeNaFaixa([IMPACTO, IMPACTO + 0.004], p, 0.012) * 0.85)
  })

  const pularCena = () => {
    const el = secao.current
    if (!el) return
    const destino = el.offsetTop + el.offsetHeight - window.innerHeight
    if (lenis) lenis.scrollTo(destino, { duration: 2.5 })
    else window.scrollTo({ top: destino, behavior: 'smooth' })
  }

  return (
    <section ref={secao} className="relative h-[720vh]" aria-label="O altar reconstruído">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          ref={brilho}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 45%, rgb(255 208 0 / 0.38), rgb(255 140 0 / 0.12) 45%, transparent 75%)',
          }}
        />

        {cena3d ? (
          <Suspense fallback={<Altar2D progresso={progresso} />}>
            <AltarCanvas progresso={progresso} />
          </Suspense>
        ) : (
          <Altar2D progresso={progresso} />
        )}

        <div ref={clarao} className="pointer-events-none absolute inset-0 bg-[#fff6c2] opacity-0" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(10_10_10/0.75)_100%)]" />

        <div ref={abertura} className="absolute inset-x-0 bottom-[12vh] px-4 text-center">
          <Eyebrow className="mb-5">Ministério Reedificando o Altar</Eyebrow>
          <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.4rem,7vw,6rem)] leading-[1.02] font-bold">
            O altar estava <GoldText>quebrado.</GoldText>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-paper/70">Role a página e ajude a reconstruí-lo, pedra por pedra.</p>
          <div className="mx-auto mt-10 h-14 w-px overflow-hidden bg-paper/15">
            <div className="h-1/2 w-full animate-scroll-hint bg-gold motion-reduce:hidden" />
          </div>
        </div>

        <div
          ref={contador}
          className="absolute top-24 right-4 flex items-start gap-4 opacity-0 sm:top-28 sm:right-10"
          aria-hidden
        >
          <div className="text-right">
            <Eyebrow className="tracking-[0.25em]!">Pedra</Eyebrow>
            <p className="font-display text-5xl leading-none font-bold sm:text-7xl">
              <span ref={numeroContador} className="text-gold">
                00
              </span>
              <span className="text-2xl text-paper/30 sm:text-3xl">/{PEDRAS}</span>
            </p>
          </div>
          <div className="flex flex-col-reverse gap-1.5 pt-1">
            {Array.from({ length: PEDRAS }, (_, i) => (
              <span
                key={i}
                ref={(m) => {
                  marcas.current[i] = m
                }}
                className="block h-1 w-5 rounded-full bg-paper/15 transition-all duration-500 data-acesa:w-8 data-acesa:bg-gold data-acesa:shadow-[0_0_12px_rgb(255_208_0/0.8)]"
                title={`Pedra ${i + 1}: ${(janelaDaPedra(i)[1] * 100).toFixed(0)}%`}
              />
            ))}
          </div>
        </div>

        {CAPITULOS.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              capitulos.current[i] = el
            }}
            className="invisible absolute inset-x-4 bottom-[10vh] opacity-0 sm:inset-x-auto sm:left-10 sm:max-w-xl md:left-16"
          >
            <p className={`font-display text-[clamp(1.6rem,3.6vw,2.9rem)] leading-tight ${glow}`}>“{c.texto}”</p>
            {c.referencia && <Eyebrow className="mt-4">{c.referencia}</Eyebrow>}
          </div>
        ))}

        <div ref={final} className="invisible absolute inset-x-0 top-[14vh] px-4 text-center opacity-0">
          <Eyebrow className="mb-4">Amós 9:11</Eyebrow>
          <p className="mx-auto max-w-3xl font-display text-[clamp(1.4rem,3.2vw,2.5rem)] leading-snug text-shadow-[0_2px_24px_rgb(0_0_0/0.9)]">
            {VERSICULO_FINAL.map((palavra, i) => (
              <span
                key={i}
                ref={(w) => {
                  palavras.current[i] = w
                }}
                className="inline-block"
              >
                {palavra}
                {i < VERSICULO_FINAL.length - 1 && ' '}
              </span>
            ))}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[8vh] px-4 text-center">
          <FinalCtas progresso={progresso} />
        </div>

        <button
          type="button"
          onClick={pularCena}
          className="absolute bottom-5 left-4 text-[11px] tracking-[0.25em] text-paper/40 uppercase hover:text-gold sm:left-10"
        >
          Pular a cena ↓
        </button>
      </div>
    </section>
  )
}

function FinalCtas({ progresso }: { progresso: RefObject<number> }) {
  const ref = useRef<HTMLDivElement>(null)
  useQuadroVisivel(ref, () => {
    const o = suave(0.93, 0.97, progresso.current ?? 0)
    if (!ref.current) return
    ref.current.style.opacity = String(o)
    ref.current.style.transform = `translateY(${(1 - o) * 20}px)`
    ref.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
  })

  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-4 opacity-0">
      <MagneticButton to="/visite">Venha ao culto</MagneticButton>
      <MagneticButton to="/lives" variante="contorno">
        Assista às lives
      </MagneticButton>
    </div>
  )
}
