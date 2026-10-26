import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'

type Props = { aberta: boolean; titulo: string; aoFechar: () => void; children: ReactNode }

export function Gaveta({ aberta, titulo, aoFechar, children }: Props) {
  useEffect(() => {
    if (!aberta) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
    }
  }, [aberta, aoFechar])

  return (
    <AnimatePresence>
      {aberta && (
        <motion.div
          className="fixed inset-0 z-[70] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={aoFechar}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full max-w-xl flex-col border-l border-paper/10 bg-coal"
          >
            <header className="flex items-center justify-between border-b border-paper/10 px-6 py-5">
              <h2 className="font-display text-xl font-semibold">{titulo}</h2>
              <button type="button" onClick={aoFechar} className="text-paper/60 hover:text-gold" aria-label="Fechar">
                ✕
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
