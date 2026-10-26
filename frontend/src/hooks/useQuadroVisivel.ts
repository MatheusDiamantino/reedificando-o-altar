import { useEffect, useRef, type RefObject } from 'react'

export function useQuadroVisivel(alvo: RefObject<Element | null>, quadro: (tempo: number) => void) {
  const atual = useRef(quadro)

  useEffect(() => {
    atual.current = quadro
  })

  useEffect(() => {
    const el = alvo.current
    if (!el) return
    let frame = 0
    const loop = (tempo: number) => {
      atual.current(tempo)
      frame = requestAnimationFrame(loop)
    }
    const observador = new IntersectionObserver(([entrada]) => {
      cancelAnimationFrame(frame)
      if (entrada.isIntersecting) frame = requestAnimationFrame(loop)
    })
    observador.observe(el)
    return () => {
      observador.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [alvo])
}
