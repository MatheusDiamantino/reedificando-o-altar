import { PageHero } from '@/components/ui/PageHero'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useConteudo } from '@/lib/queries'
import { SEO } from '@/lib/seo'
import { FormContato } from './FormContato'
import { FormOracao } from './FormOracao'

export function ContatoPage() {
  usePageMeta(SEO['/contato'])
  const { data: c } = useConteudo()
  if (!c) return null
  const whatsapp = c.redes.whatsapp.replace(/\D/g, '')

  return (
    <>
      <PageHero
        eyebrow="Contato"
        titulo="Estamos aqui por você."
        subtitulo={c.textos.contato_intro}
        imagem="/img/banner.webp"
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <FormOracao />
          <div className="space-y-8">
            <FormContato />
            <div className="flex flex-wrap gap-x-8 gap-y-3 px-2 text-sm text-paper/70">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-gold">
                  WhatsApp
                </a>
              )}
              <a href={`mailto:${c.email}`} className="break-all hover:text-gold">
                {c.email}
              </a>
              <a href={c.redes.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                Instagram
              </a>
              <a href={c.redes.facebook_grupo} target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
