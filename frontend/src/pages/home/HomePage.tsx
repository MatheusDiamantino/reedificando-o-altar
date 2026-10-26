import { AltarExperience } from '@/components/altar/AltarExperience'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SEO } from '@/lib/seo'
import { Countdown } from './sections/Countdown'
import { LatestLive } from './sections/LatestLive'
import { PalavraDoDia } from './sections/PalavraDoDia'
import { UpcomingEvents } from './sections/UpcomingEvents'
import { VisitCta } from './sections/VisitCta'
import { Welcome } from './sections/Welcome'

export function HomePage() {
  usePageMeta(SEO['/'])

  return (
    <>
      <AltarExperience />
      <Countdown />
      <Welcome />
      <PalavraDoDia />
      <LatestLive />
      <UpcomingEvents />
      <VisitCta />
    </>
  )
}
