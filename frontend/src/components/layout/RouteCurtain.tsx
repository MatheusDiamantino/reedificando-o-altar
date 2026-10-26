import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteCurtain() {
  const { pathname } = useLocation()
  const reduzirMovimento = useReducedMotion()
  const primeira = useRef(true)
  const [passagem, setPassagem] = useState(0)

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false
      return
    }
    setPassagem((n) => n + 1)
  }, [pathname])

  if (reduzirMovimento || passagem === 0) return null

  return (
    <motion.div
      key={passagem}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-[90] h-[140vh]"
      style={{
        background:
          'linear-gradient(to bottom, transparent 0%, rgb(255 208 0 / 0.0) 5%, #ffd000 30%, #fff6c2 50%, #ffd000 70%, rgb(255 208 0 / 0) 95%, transparent 100%)',
      }}
      initial={{ top: '100vh' }}
      animate={{ top: '-140vh' }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}
