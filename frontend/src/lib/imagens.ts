const VARIANTES: Record<string, [menor: number, original: number]> = {
  '/img/banner.webp': [800, 1920],
  '/img/culto.webp': [800, 1600],
  '/img/eventos.webp': [800, 1920],
  '/img/sobre.webp': [800, 1200],
}

export function srcSet(src: string) {
  const variante = VARIANTES[src] ?? (src.startsWith('/img/lideres/') ? [360, 720] : null)
  if (!variante) return undefined
  const [menor, original] = variante
  return `${src.replace(/\.webp$/, `-${menor}.webp`)} ${menor}w, ${src} ${original}w`
}
