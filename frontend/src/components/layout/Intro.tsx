import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { noNavegador } from '@/lib/ambiente'

const CHAVE = 'mra-intro-vista'
const LIMITE_CARREGAMENTO = 1200

function jaViu() {
  try {
    return sessionStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

function marcarVista() {
  try {
    sessionStorage.setItem(CHAVE, '1')
  } catch {}
}

const FAISCAS = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)

export function Intro() {
  const reduzirMovimento = useReducedMotion()
  const [visivel, setVisivel] = useState(
    () => noNavegador && !jaViu() && performance.now() < LIMITE_CARREGAMENTO && window.scrollY === 0,
  )

  useEffect(() => {
    if (!visivel) return
    marcarVista()
    const t = setTimeout(() => setVisivel(false), reduzirMovimento ? 300 : 1900)
    return () => clearTimeout(t)
  }, [visivel, reduzirMovimento])

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          aria-hidden
        >
          <div className="relative grid size-40 place-items-center">
            <motion.span
              className="absolute size-3 rounded-full bg-ember shadow-[0_0_40px_12px_rgb(255_208_0/0.6)]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, times: [0, 0.35, 0.7, 1] }}
            />
            {FAISCAS.map((angulo, i) => (
              <motion.span
                key={i}
                className="absolute h-0.5 w-6 rounded-full bg-gradient-to-r from-transparent to-gold"
                style={{ rotate: `${(angulo * 180) / Math.PI}deg` }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(angulo) * 90],
                  y: [0, Math.sin(angulo) * 90],
                  opacity: [0, 1, 0],
                }}
                transition={{ delay: 0.45, duration: 0.7, ease: 'easeOut' }}
              />
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo className="size-24" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
