import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import { conteudoPadrao } from './fallback'
import type { Conteudo, Evento, Live } from './types'

export function useConteudo() {
  return useQuery({
    queryKey: ['conteudo'],
    queryFn: () => api<Partial<Conteudo>>('/conteudo'),
    select: (c): Conteudo => ({
      ...conteudoPadrao,
      ...c,
      redes: { ...conteudoPadrao.redes, ...c.redes },
      textos: { ...conteudoPadrao.textos, ...c.textos },
    }),
    placeholderData: conteudoPadrao,
    staleTime: 10 * 60_000,
  })
}

export function useLives(limit = 12, busca = '') {
  const q = busca.trim()
  return useQuery({
    queryKey: ['lives', limit, q],
    queryFn: () => api<Live[]>(`/lives?limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    placeholderData: (anterior) => anterior,
    staleTime: 5 * 60_000,
  })
}

export function useLiveAtual() {
  return useQuery({
    queryKey: ['lives', 'atual'],
    queryFn: () => api<Live | null>('/lives/atual'),
    refetchInterval: 60_000,
  })
}

export function useEventosPeriodo(de: string, ate: string) {
  return useQuery({
    queryKey: ['eventos', de, ate],
    queryFn: () => api<Evento[]>(`/eventos?de=${de}&ate=${ate}`),
    placeholderData: (anterior) => anterior,
    staleTime: 10 * 60_000,
  })
}

export function useEventos(dias = 60) {
  const de = new Date()
  const ate = new Date(de.getTime() + dias * 86_400_000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return useQuery({
    queryKey: ['eventos', iso(de), dias],
    queryFn: () => api<Evento[]>(`/eventos?de=${iso(de)}&ate=${iso(ate)}`),
    staleTime: 10 * 60_000,
  })
}
