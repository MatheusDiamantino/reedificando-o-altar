import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'

export function Moldura({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[80vmax] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_208_0/0.1),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-6 size-16" />
          <h1 className="font-display text-3xl font-bold">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-paper/60">{subtitulo}</p>}
        </div>
        <div className="rounded-2xl border border-paper/10 bg-coal p-6 sm:p-8">{children}</div>
      </motion.div>
    </div>
  )
}
