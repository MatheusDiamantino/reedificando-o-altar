import { motion } from 'motion/react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow, GoldText } from '@/components/ui/Typography'
import { formatarHora, NOME_DIA } from '@/lib/horarios'
import { useConteudo } from '@/lib/queries'

export function VisitCta() {
  const { data: c } = useConteudo()
  if (!c) return null
  const { endereco } = c
  const destino = encodeURIComponent(`${endereco.rua}, ${endereco.cidade} - ${endereco.uf}`)

  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_center,rgb(255_208_0/0.6)_1px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)] [background-size:28px_28px] opacity-[0.15]" />

      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-1/2"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 size-[min(80vw,640px)] -translate-1/2 animate-ping rounded-full border border-gold/20 [animation-duration:4s] motion-reduce:animate-none"
            style={{ animationDelay: `${i * 1.3}s` }}
          />
        ))}
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-8">
        <Eyebrow className="mb-6">Visite-nos</Eyebrow>
        <h2 className="font-display text-[clamp(2.4rem,6vw,5.2rem)] leading-[1.02] font-bold">
          Tem um lugar <GoldText>guardado</GoldText> para você.
        </h2>
        <p className="mt-8 text-xl text-paper/80">
          {endereco.rua} · {endereco.cidade}/{endereco.uf}
        </p>
        <p className="mt-2 text-paper/60">
          {c.horarios.map((h) => `${NOME_DIA[h.dia]}, ${formatarHora(h.inicio)} às ${formatarHora(h.fim)}`).join(' · ')}
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <MagneticButton href={`https://www.google.com/maps/dir/?api=1&destination=${destino}`}>
            Abrir no Google Maps
          </MagneticButton>
          <MagneticButton href={`https://waze.com/ul?q=${destino}&navigate=yes`} variante="contorno">
            Ir com Waze
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
