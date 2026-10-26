import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useQuadroVisivel } from '@/hooks/useQuadroVisivel'

type Props = {
  children: ReactNode
  revelado: ReactNode
  className?: string
  raio?: number
}

export function TorchReveal({ children, revelado, className = '', raio = 180 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduzirMovimento = useReducedMotion()
  const estado = useRef({ alvoX: 0.5, alvoY: 0.5, x: 0.5, y: 0.5, ultimoInput: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const definir = (nx: number, ny: number) => {
      Object.assign(estado.current, { alvoX: nx, alvoY: ny, ultimoInput: performance.now() })
    }
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      definir((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
    }
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      definir(0.5 + e.gamma / 60, 0.5 + (e.beta - 45) / 60)
    }
    el.addEventListener('pointermove', onPointer)
    window.addEventListener('deviceorientation', onOrientation)
    return () => {
      el.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [])

  useQuadroVisivel(ref, (t) => {
    const s = estado.current
    const el = ref.current
    if (!el) return
    if (!reduzirMovimento && t - s.ultimoInput > 3000) {
      s.alvoX = 0.5 + Math.sin(t / 2300) * 0.32
      s.alvoY = 0.5 + Math.cos(t / 3100) * 0.25
    }
    s.x += (s.alvoX - s.x) * 0.08
    s.y += (s.alvoY - s.y) * 0.08
    el.style.setProperty('--tx', `${s.x * 100}%`)
    el.style.setProperty('--ty', `${s.y * 100}%`)
  })

  const mascara = `radial-gradient(circle ${raio}px at var(--tx, 50%) var(--ty, 50%), #000 0%, rgb(0 0 0 / 0.6) 45%, transparent 100%)`

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      >
        {revelado}
      </div>
    </div>
  )
}
