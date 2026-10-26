import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  children: ReactNode
  to?: string
  href?: string
  variante?: 'ouro' | 'contorno'
  className?: string
}

export function MagneticButton({ children, to, href, variante = 'ouro', className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })

  const mover = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const soltar = () => {
    x.set(0)
    y.set(0)
  }

  const estilo =
    variante === 'ouro'
      ? 'bg-gold text-ink hover:shadow-[0_0_40px_rgb(255_208_0/0.55)]'
      : 'border border-gold/60 text-gold hover:bg-gold hover:text-ink'

  const conteudo = (
    <motion.span
      ref={ref}
      style={{ x, y }}
      onPointerMove={mover}
      onPointerLeave={soltar}
      className={`inline-flex items-center gap-3 rounded-full px-7 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-[background,color,box-shadow] duration-300 ${estilo} ${className}`}
    >
      {children}
    </motion.span>
  )

  if (to) return <Link to={to}>{conteudo}</Link>
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {conteudo}
    </a>
  )
}
