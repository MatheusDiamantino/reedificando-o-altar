import { AnimatePresence, motion } from 'motion/react'
import { useSyncExternalStore } from 'react'

type Aviso = { id: number; texto: string; tipo: 'ok' | 'erro' }

let avisos: Aviso[] = []
const ouvintes = new Set<() => void>()
let proximo = 1

function emitir() {
  ouvintes.forEach((o) => o())
}

export function avisar(texto: string, tipo: Aviso['tipo'] = 'ok') {
  const id = proximo++
  avisos = [...avisos, { id, texto, tipo }]
  emitir()
  setTimeout(() => {
    avisos = avisos.filter((a) => a.id !== id)
    emitir()
  }, 3800)
}

export function avisarErro(e: unknown) {
  avisar(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.', 'erro')
}

export function Avisos() {
  const lista = useSyncExternalStore(
    (o) => {
      ouvintes.add(o)
      return () => ouvintes.delete(o)
    },
    () => avisos,
    () => avisos,
  )

  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-[90] flex flex-col items-end gap-2 lg:bottom-6">
      <AnimatePresence>
        {lista.map((a) => (
          <motion.p
            key={a.id}
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`rounded-xl px-4 py-3 text-sm font-medium shadow-2xl ${
              a.tipo === 'ok' ? 'bg-gold text-ink' : 'bg-red-500 text-paper'
            }`}
          >
            {a.texto}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  )
}
