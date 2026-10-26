import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'

export function useEnvio(rota: '/contato' | '/oracao') {
  const envio = useMutation({
    mutationFn: (dados: Record<string, unknown>) => api(rota, { method: 'POST', body: JSON.stringify(dados) }),
  })
  const erro = envio.error instanceof ApiError ? envio.error : null
  return {
    enviar: envio.mutateAsync,
    enviando: envio.isPending,
    erroGeral: envio.error ? (erro?.message ?? 'Não foi possível enviar. Tente de novo.') : null,
    erros: erro?.fields ?? {},
    reiniciar: envio.reset,
  }
}
