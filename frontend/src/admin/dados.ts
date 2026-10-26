import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Conteudo, Evento, Live } from '@/lib/types'
import type { Mensagem, OEmbed, Resumo, Usuario } from './tipos'

const json = (dados: unknown) => JSON.stringify(dados)

function useGravar<T, R = unknown>(fn: (dados: T) => Promise<R>, invalidar: QueryKey[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => invalidar.forEach((chave) => qc.invalidateQueries({ queryKey: chave })),
  })
}

export const useResumo = () => useQuery({ queryKey: ['admin', 'resumo'], queryFn: () => api<Resumo>('/admin/resumo') })

export const useLivesAdmin = () =>
  useQuery({ queryKey: ['admin', 'lives'], queryFn: () => api<Live[]>('/lives?limit=200') })

export function useOEmbed(url: string) {
  const valido = /^https?:\/\/\S+\.\S+/.test(url)
  return useQuery({
    queryKey: ['admin', 'oembed', url],
    queryFn: () => api<OEmbed>(`/admin/oembed?url=${encodeURIComponent(url)}`),
    enabled: valido,
    retry: false,
    staleTime: Infinity,
  })
}

export type DadosLive = Partial<Pick<Live, 'titulo' | 'descricao' | 'link' | 'data_live' | 'ao_vivo' | 'destaque'>> & {
  baixar_capa?: boolean
}

const chavesLives: QueryKey[] = [['admin'], ['lives']]

export const useCriarLive = () =>
  useGravar((d: DadosLive) => api<Live>('/admin/lives', { method: 'POST', body: json(d) }), chavesLives)

export const useEditarLive = () =>
  useGravar(
    ({ id, ...d }: DadosLive & { id: number }) => api<Live>(`/admin/lives/${id}`, { method: 'PUT', body: json(d) }),
    chavesLives,
  )

export const useExcluirLive = () =>
  useGravar((id: number) => api(`/admin/lives/${id}`, { method: 'DELETE' }), chavesLives)

export const useEnviarCapa = () =>
  useGravar(({ id, arquivo }: { id: number; arquivo: File }) => {
    const form = new FormData()
    form.append('imagem', arquivo)
    return api<Live>(`/admin/lives/${id}/thumbnail`, { method: 'POST', body: form })
  }, chavesLives)

export const useEventosAdmin = () =>
  useQuery({ queryKey: ['admin', 'eventos'], queryFn: () => api<Evento[]>('/admin/eventos') })

export type DadosEvento = Omit<Evento, 'id'>
const chavesEventos: QueryKey[] = [['admin'], ['eventos']]

export const useSalvarEvento = () =>
  useGravar(
    ({ id, ...d }: DadosEvento & { id?: number }) =>
      api<Evento>(id ? `/admin/eventos/${id}` : '/admin/eventos', { method: id ? 'PUT' : 'POST', body: json(d) }),
    chavesEventos,
  )

export const useExcluirEvento = () =>
  useGravar((id: number) => api(`/admin/eventos/${id}`, { method: 'DELETE' }), chavesEventos)

export function useMensagens(tipo: '' | Mensagem['tipo'], lida: '' | 'true' | 'false') {
  const params = new URLSearchParams()
  if (tipo) params.set('tipo', tipo)
  if (lida) params.set('lida', lida)
  return useQuery({
    queryKey: ['admin', 'mensagens', tipo, lida],
    queryFn: () => api<Mensagem[]>(`/admin/mensagens?${params}`),
  })
}

export const useMarcarMensagem = () =>
  useGravar(
    ({ id, lida }: { id: number; lida: boolean }) =>
      api(`/admin/mensagens/${id}`, { method: 'PATCH', body: json({ lida }) }),
    [['admin']],
  )

export const useExcluirMensagem = () =>
  useGravar((id: number) => api(`/admin/mensagens/${id}`, { method: 'DELETE' }), [['admin']])

export const useSalvarConteudo = () =>
  useGravar(
    (d: Partial<Conteudo>) => api<Conteudo>('/admin/conteudo', { method: 'PUT', body: json(d) }),
    [['conteudo']],
  )

export const useEnviarImagem = () =>
  useMutation({
    mutationFn: (arquivo: File) => {
      const form = new FormData()
      form.append('imagem', arquivo)
      return api<{ url: string }>('/admin/imagens', { method: 'POST', body: form })
    },
  })

export const useUsuarios = () =>
  useQuery({ queryKey: ['admin', 'usuarios'], queryFn: () => api<Usuario[]>('/admin/usuarios') })

export type DadosUsuario = Partial<Pick<Usuario, 'nome' | 'email' | 'papel' | 'ativo'>> & {
  senha?: string
  senha_atual?: string
}

export const useSalvarUsuario = () =>
  useGravar(
    ({ id, ...d }: DadosUsuario & { id?: number }) =>
      api<Usuario>(id ? `/admin/usuarios/${id}` : '/admin/usuarios', { method: id ? 'PUT' : 'POST', body: json(d) }),
    [['admin', 'usuarios']],
  )

export const useExcluirUsuario = () =>
  useGravar((id: number) => api(`/admin/usuarios/${id}`, { method: 'DELETE' }), [['admin', 'usuarios']])
