import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LenisContext } from '@/hooks/useLenis'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduzirMovimento = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (reduzirMovimento) return
    const instancia = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    instancia.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instancia.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instancia)
    return () => {
      gsap.ticker.remove(tick)
      instancia.destroy()
      setLenis(null)
    }
  }, [reduzirMovimento])

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
