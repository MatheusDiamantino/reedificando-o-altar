import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import type { Usuario } from './tipos'

export function useSessao() {
  return useQuery({
    queryKey: ['sessao'],
    queryFn: async () => {
      try {
        return (await api<{ user: Usuario }>('/auth/me')).user
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })
}

export function useEntrar() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['entrar'],
    mutationFn: (dados: { email: string; senha: string; lembrar: boolean }) =>
      api<{ user: Usuario }>('/auth/login', { method: 'POST', body: JSON.stringify(dados) }),
    onSuccess: ({ user }) => qc.setQueryData(['sessao'], user),
  })
}

export function useSair() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      qc.clear()
      qc.setQueryData(['sessao'], null)
    },
  })
}
