import { useEffect } from 'react'
import type { Meta } from '@/lib/seo'

export function usePageMeta({ titulo, descricao }: Partial<Meta> & { titulo: string }) {
  useEffect(() => {
    document.title = titulo
    if (descricao) document.querySelector('meta[name="description"]')?.setAttribute('content', descricao)
  }, [titulo, descricao])
}
