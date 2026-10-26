import { useReducedMotion } from 'motion/react'
import { useMemo, useRef, type RefObject } from 'react'
import { useQuadroVisivel } from '@/hooks/useQuadroVisivel'
import {
  aleatorio,
  easeInOutCubic,
  FOGO_ACESO,
  FOGO_DESCE,
  janelaDaPedra,
  lugarDaPedra,
  PEDRAS,
  progressoEm,
  suave,
} from './timeline'

type Props = { progresso: RefObject<number> }

const L = 64
const A = 40
const PASSO_X = 68
const PASSO_Y = 43
const BASE_Y = 300

export default function Altar2D({ progresso }: Props) {
  const reduzirMovimento = useReducedMotion()
  const pedrasRef = useRef<(SVGGElement | null)[]>([])
  const chama = useRef<SVGGElement>(null)
  const halo = useRef<SVGCircleElement>(null)
  const raio = useRef<SVGRectElement>(null)
  const palco = useRef<HTMLDivElement>(null)

  const pedras = useMemo(
    () =>
      Array.from({ length: PEDRAS }, (_, i) => {
        const r = aleatorio(i * 31 + 3)
        const { fileira, indice, total } = lugarDaPedra(i)
        return {
          final: { x: 200 + (indice - (total - 1) / 2) * PASSO_X, y: BASE_Y - fileira * PASSO_Y },
          solta: { x: 30 + r() * 340, y: 30 + r() * 200, giro: (r() - 0.5) * 140 },
          tom: 22 + Math.round(r() * 14),
        }
      }),
    [],
  )
  const topo = BASE_Y - 2 * PASSO_Y - A / 2

  useQuadroVisivel(palco, (t) => {
    const p = progresso.current ?? 0
    pedras.forEach((pedra, i) => {
      const g = pedrasRef.current[i]
      if (!g) return
      const k = easeInOutCubic(progressoEm(janelaDaPedra(i), p))
      const flutua = reduzirMovimento ? 0 : Math.sin(t / 900 + i) * 6 * (1 - k)
      const x = pedra.solta.x + (pedra.final.x - pedra.solta.x) * k
      const y = pedra.solta.y + (pedra.final.y - pedra.solta.y) * k + flutua - Math.sin(k * Math.PI) * 40
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${pedra.solta.giro * (1 - k)})`)
    })
    const fogo = suave(FOGO_DESCE + 0.03, FOGO_ACESO, p)
    const desce = suave(FOGO_DESCE, FOGO_DESCE + 0.04, p) * (1 - suave(FOGO_DESCE + 0.05, FOGO_ACESO + 0.04, p))
    chama.current?.setAttribute('opacity', String(fogo))
    chama.current?.setAttribute('transform', `translate(200 ${topo}) scale(${0.3 + fogo * 0.7})`)
    halo.current?.setAttribute('opacity', String(fogo * 0.8))
    raio.current?.setAttribute('opacity', String(desce))
  })

  return (
    <div ref={palco} className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 400 360" className="h-[70vh] max-h-[640px] w-full max-w-[720px]" aria-hidden>
        <defs>
          <radialGradient id="a2d-halo">
            <stop offset="0" stopColor="#ffd000" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="a2d-chama" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ff8a00" />
            <stop offset="0.5" stopColor="#ffd000" />
            <stop offset="1" stopColor="#fffbd0" />
          </linearGradient>
          <linearGradient id="a2d-raio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6c2" stopOpacity="0" />
            <stop offset="1" stopColor="#fff6c2" stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle ref={halo} cx="200" cy={topo} r="170" fill="url(#a2d-halo)" opacity="0" />
        <rect ref={raio} x="188" y="-40" width="24" height={topo + 40} fill="url(#a2d-raio)" opacity="0" />
        <ellipse cx="200" cy={BASE_Y + A / 2 + 6} rx="190" ry="10" fill="#000" opacity="0.6" />

        {pedras.map((pedra, i) => (
          <g
            key={i}
            ref={(g) => {
              pedrasRef.current[i] = g
            }}
          >
            <path
              d={`M${-L / 2 + 4} ${-A / 2} H${L / 2 - 3} L${L / 2} ${-A / 2 + 5} V${A / 2 - 3} L${L / 2 - 5} ${A / 2} H${-L / 2 + 3} L${-L / 2} ${A / 2 - 6} V${-A / 2 + 3} Z`}
              fill={`hsl(35 12% ${pedra.tom}%)`}
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            <path
              d={`M${-L / 2 + 6} ${-A / 2 + 4} H${L / 2 - 8}`}
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="2"
            />
          </g>
        ))}

        <g ref={chama} opacity="0">
          <path
            d="M0 -120c12 26-10 40-4 64 6-10 16-14 20-28 18 24 16 56-6 74-7 6-16 9-26 10 10-10 13-26 3-38-7 10-17 17-20 31-14-20 0-42 14-56-7-20 6-40 19-57z"
            transform="translate(-4 4)"
            fill="url(#a2d-chama)"
            className="origin-[0px_0px] animate-flicker motion-reduce:animate-none"
          />
        </g>
      </svg>
    </div>
  )
}
