import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow } from '@/components/ui/Typography'
import { usePageMeta } from '@/hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({ titulo: 'Página não encontrada | Ministério Reedificando o Altar' })

  return (
    <section className="relative grid min-h-svh place-items-center overflow-hidden px-4 text-center">
      <p
        aria-hidden
        className="pointer-events-none absolute font-display text-[45vw] leading-none font-black text-transparent select-none [-webkit-text-stroke:1px_rgb(255_255_255/0.06)]"
      >
        404
      </p>
      <div className="relative">
        <Eyebrow className="mb-6">Pedra fora do lugar</Eyebrow>
        <h1 className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-tight font-bold">Esta página não existe.</h1>
        <p className="mx-auto mt-6 max-w-md text-paper/60">
          “A pedra que os edificadores rejeitaram, essa foi posta por cabeça de esquina.” Salmos 118:22
        </p>
        <div className="mt-10">
          <MagneticButton to="/">Voltar ao altar</MagneticButton>
        </div>
      </div>
    </section>
  )
}
