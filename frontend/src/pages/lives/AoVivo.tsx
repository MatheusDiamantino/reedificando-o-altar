import { embedDaLive } from '@/lib/lives'
import type { Live } from '@/lib/types'

export function AoVivo({ live }: { live: Live }) {
  const embed = embedDaLive(live)?.replace('autoplay=1', 'autoplay=0').replace('autoplay=true', 'autoplay=false')

  return (
    <section className="relative bg-coal py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <p className="mb-6 flex items-center gap-3">
          <span className="flex animate-live-pulse items-center gap-2 rounded-full bg-ember px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase">
            <span className="size-2 rounded-full bg-red-600" />
            Ao vivo agora
          </span>
          <span className="font-display text-xl font-semibold sm:text-2xl">{live.titulo}</span>
        </p>
        {embed ? (
          <div className="aspect-video overflow-hidden rounded-[1.75rem] shadow-[0_0_140px_rgb(255_208_0/0.25)] ring-1 ring-gold/40">
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
            className="block rounded-[1.75rem] bg-ink p-12 text-center font-display text-2xl text-gold ring-1 ring-gold/40"
          >
            Entrar na transmissão ↗
          </a>
        )}
      </div>
    </section>
  )
}
