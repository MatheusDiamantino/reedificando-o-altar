import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { PageHero } from '@/components/ui/PageHero'
import { RevealText } from '@/components/ui/RevealText'
import { Eyebrow } from '@/components/ui/Typography'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatarHora, NOME_DIA } from '@/lib/horarios'
import { useConteudo } from '@/lib/queries'
import { SEO } from '@/lib/seo'

const PASSOS = [
  { titulo: 'Chegue como está', texto: 'Não existe roupa certa nem pré-requisito. Você será recebido com alegria.' },
  { titulo: 'Louvor', texto: 'Começamos adorando a Deus juntos, de coração aberto.' },
  { titulo: 'Palavra', texto: 'Uma mensagem bíblica para a sua semana e para a sua vida.' },
  { titulo: 'Oração e comunhão', texto: 'Oramos uns pelos outros. Se quiser, alguém pode orar com você.' },
]

export function VisitePage() {
  usePageMeta(SEO['/visite'])
  const { data: c } = useConteudo()
  if (!c) return null
  const { endereco } = c
  const destino = encodeURIComponent(`${endereco.rua}, ${endereco.cidade} - ${endereco.uf}`)
  const whatsapp = c.redes.whatsapp.replace(/\D/g, '')

  return (
    <>
      <PageHero
        eyebrow="Visite-nos"
        titulo="Tem um lugar guardado para você."
        subtitulo={`${endereco.rua}, ${endereco.cidade}/${endereco.uf}`}
        imagem="/img/sobre.webp"
      />

      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-coal ring-1 ring-gold/30">
            <MapaAdiado titulo={`Mapa: ${endereco.rua}, ${endereco.cidade}`} destino={destino} />
            <div className="pointer-events-none absolute inset-0 bg-gold/20 mix-blend-multiply" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgb(10_10_10/0.9)]" />
            <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] bg-ink/85 p-6 backdrop-blur-md sm:inset-x-auto sm:bottom-8 sm:left-8 sm:max-w-sm sm:p-8">
              <p className="font-display text-2xl font-semibold">{endereco.rua}</p>
              <p className="text-paper/70">
                {endereco.cidade}/{endereco.uf}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <MagneticButton href={`https://www.google.com/maps/dir/?api=1&destination=${destino}`}>
                  Google Maps
                </MagneticButton>
                <MagneticButton href={`https://waze.com/ul?q=${destino}&navigate=yes`} variante="contorno">
                  Waze
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Cartao rotulo="Horários">
              {c.horarios.map((h) => (
                <p key={h.dia + h.inicio}>
                  <span className="font-display text-2xl font-semibold text-gold">{NOME_DIA[h.dia]}</span>
                  <br />
                  {formatarHora(h.inicio)} às {formatarHora(h.fim)} · {h.nome}
                </p>
              ))}
            </Cartao>
            <Cartao rotulo="Endereço">
              <p className="font-display text-2xl font-semibold">{endereco.rua}</p>
              <p className="text-paper/70">
                {endereco.cidade}/{endereco.uf}
              </p>
            </Cartao>
            <Cartao rotulo="Fale com a gente">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-gold hover:underline"
                >
                  WhatsApp
                </a>
              )}
              <a href={`mailto:${c.email}`} className="block text-sm [overflow-wrap:anywhere] hover:text-gold">
                {c.email}
              </a>
              <a href={c.redes.instagram} target="_blank" rel="noreferrer" className="block hover:text-gold">
                Instagram
              </a>
            </Cartao>
          </div>
        </div>
      </section>

      <section className="bg-coal py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <Eyebrow className="mb-5">Primeira visita</Eyebrow>
          <RevealText
            as="h2"
            texto="O que esperar do culto."
            className="mb-16 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none font-bold"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <motion.li
                key={p.titulo}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mb-6 grid size-16 place-items-center rounded-[1rem_0.7rem_1.1rem_0.6rem] border border-gold/50 bg-linear-to-br from-[#3a332a] to-[#1c1a17] font-display text-2xl font-bold text-gold">
                  {i + 1}
                </span>
                <h3 className="font-display text-2xl font-semibold">{p.titulo}</h3>
                <p className="mt-3 text-paper/65">{p.texto}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

function Cartao({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-[1.5rem] border border-paper/10 bg-coal p-8">
      <Eyebrow className="mb-4">{rotulo}</Eyebrow>
      {children}
    </div>
  )
}

function MapaAdiado({ titulo, destino }: { titulo: string; destino: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [perto, setPerto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let espera = 0
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return
      observador.disconnect()
      const montar = () => {
        espera = window.setTimeout(() => setPerto(true), 600)
      }
      if (document.readyState === 'complete') montar()
      else window.addEventListener('load', montar, { once: true })
    })
    observador.observe(el)
    return () => {
      observador.disconnect()
      window.clearTimeout(espera)
    }
  }, [])

  return (
    <div ref={ref} className="h-[60svh] min-h-[420px] w-full">
      {perto && (
        <iframe
          title={titulo}
          src={`https://www.google.com/maps?q=${destino}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block size-full [filter:grayscale(1)_invert(0.92)_contrast(0.95)]"
        />
      )}
    </div>
  )
}
