import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opcoes: Record<string, unknown>) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

const CHAVE = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let carregando: Promise<void> | null = null

function carregarScript() {
  carregando ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
  return carregando
}

export function Turnstile({ aoVerificar }: { aoVerificar: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!CHAVE || !ref.current) return
    let id: string | undefined
    let ativo = true
    carregarScript().then(() => {
      if (!ativo || !ref.current || !window.turnstile) return
      id = window.turnstile.render(ref.current, { sitekey: CHAVE, theme: 'dark', callback: aoVerificar })
    })
    return () => {
      ativo = false
      if (id) window.turnstile?.remove(id)
    }
  }, [aoVerificar])

  if (!CHAVE) return null
  return <div ref={ref} />
}
