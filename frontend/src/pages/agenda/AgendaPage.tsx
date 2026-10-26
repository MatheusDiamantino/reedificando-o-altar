import { PageHero } from '@/components/ui/PageHero'
import { usePageMeta } from '@/hooks/usePageMeta'
import { hojeIso, somarDias } from '@/lib/datas'
import { useEventosPeriodo } from '@/lib/queries'
import { SEO } from '@/lib/seo'
import { Calendario } from './Calendario'
import { Fixos } from './Fixos'
import { Trilha } from './Trilha'

export function AgendaPage() {
  usePageMeta(SEO['/agenda'])
  const hoje = hojeIso()
  const { data: eventos = [] } = useEventosPeriodo(hoje, somarDias(hoje, 120))
  const fixos = eventos.filter(
    (e, i, todos) => e.recorrencia === 'semanal' && todos.findIndex((o) => o.id === e.id) === i,
  )
  const trilha = eventos.filter((e) => e.recorrencia !== 'semanal').slice(0, 12)

  return (
    <>
      <PageHero
        eyebrow="Agenda"
        titulo="O caminho, pedra por pedra."
        subtitulo="Cultos, encontros e eventos. Separe a data e venha com a família."
        imagem="/img/eventos.webp"
      />
      <Fixos semanais={fixos} />
      <Calendario />
      <Trilha eventos={trilha} />
    </>
  )
}
