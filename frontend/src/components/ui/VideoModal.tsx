import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { embedDaLive } from '@/lib/lives'
import type { Live } from '@/lib/types'

type Props = { live: Live | null; aoFechar: () => void }

export function VideoModal({ live, aoFechar }: Props) {
  const lenis = useLenis()
  const embed = live ? embedDaLive(live) : null

  useEffect(() => {
    if (!live) return
    lenis?.stop()
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', tecla)
    }
  }, [live, lenis, aoFechar])

  return (
    <AnimatePresence>
      {live && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={aoFechar}
          role="dialog"
          aria-modal="true"
          aria-label={live.titulo}
        >
          <motion.div
            className="w-full max-w-5xl"
            initial={{ scale: 0.92, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-6">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">{live.titulo}</h2>
              <button
                type="button"
                onClick={aoFechar}
                className="shrink-0 text-xs font-semibold tracking-[0.25em] text-paper/60 uppercase hover:text-gold"
              >
                Fechar ✕
              </button>
            </div>
            {embed ? (
              <div className="aspect-video overflow-hidden rounded-2xl bg-coal shadow-[0_0_120px_rgb(255_208_0/0.2)] ring-1 ring-gold/30">
                <iframe
                  src={embed}
                  title={live.titulo}
                  className="size-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={live.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-coal p-10 text-center text-gold ring-1 ring-gold/30"
              >
                Assistir no site original ↗
              </a>
            )}
            {live.descricao && <p className="mt-4 max-w-3xl text-paper/70">{live.descricao}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
