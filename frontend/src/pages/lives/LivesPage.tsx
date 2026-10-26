import { useCallback, useDeferredValue, useState } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import { VideoModal } from '@/components/ui/VideoModal'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useLiveAtual, useLives } from '@/lib/queries'
import { SEO } from '@/lib/seo'
import type { Live } from '@/lib/types'
import { AoVivo } from './AoVivo'
import { Busca } from './Busca'
import { GaleriaCinema } from './GaleriaCinema'

export function LivesPage() {
  usePageMeta(SEO['/lives'])
  const [busca, setBusca] = useState('')
  const termo = useDeferredValue(busca)
  const [aberta, setAberta] = useState<Live | null>(null)
  const { data: lives = [], isLoading, isError } = useLives(60, termo)
  const { data: atual } = useLiveAtual()
  const fechar = useCallback(() => setAberta(null), [])

  return (
    <>
      <PageHero
        eyebrow="Cultos e lives"
        titulo="A Palavra, onde você estiver."
        subtitulo="Assista ao vivo aos domingos ou reveja cada mensagem quando precisar."
        imagem="/img/culto.webp"
      />

      {atual && <AoVivo live={atual} />}

      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <Busca valor={busca} aoMudar={setBusca} total={lives.length} carregando={isLoading} />
        </div>

        {isError ? (
          <p className="mx-auto mt-16 max-w-7xl px-4 text-paper/60 sm:px-8">Não conseguimos carregar as lives agora.</p>
        ) : lives.length === 0 && !isLoading ? (
          <p className="mx-auto mt-16 max-w-7xl px-4 text-paper/60 sm:px-8">
            {termo ? `Nenhuma live encontrada para “${termo}”.` : 'As lives aparecem aqui assim que forem publicadas.'}
          </p>
        ) : (
          <GaleriaCinema key={termo} lives={lives} aoAbrir={setAberta} />
        )}
      </section>

      <VideoModal live={aberta} aoFechar={fechar} />
    </>
  )
}
