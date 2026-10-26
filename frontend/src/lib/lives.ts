import type { Live } from './types'

export function capaDaLive(live: Live) {
  if (live.thumbnail_url) return live.thumbnail_url
  if (live.plataforma === 'youtube' && live.video_id) return `https://i.ytimg.com/vi/${live.video_id}/hqdefault.jpg`
  return '/img/culto.webp'
}

export function embedDaLive(live: Live) {
  if (live.plataforma === 'youtube' && live.video_id) {
    return `https://www.youtube-nocookie.com/embed/${live.video_id}?autoplay=1&rel=0`
  }
  if (live.plataforma === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(live.link)}&autoplay=true`
  }
  return null
}

export const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
