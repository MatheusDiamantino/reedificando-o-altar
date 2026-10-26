import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { noNavegador } from '@/lib/ambiente'

export function CursorGlow() {
  const reduzirMovimento = useReducedMotion()
  const [ponteiroFino] = useState(() => noNavegador && window.matchMedia('(pointer: fine)').matches)
  const ativo = ponteiroFino && !reduzirMovimento
  const x = useMotionValue(-500)
  const y = useMotionValue(-500)
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (!ativo) return
    const mover = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [ativo, x, y])

  if (!ativo) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[55] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
      style={{
        x: sx,
        y: sy,
        background: 'radial-gradient(circle, rgb(255 208 0 / 0.10) 0%, rgb(255 208 0 / 0.04) 35%, transparent 65%)',
      }}
    />
  )
}
