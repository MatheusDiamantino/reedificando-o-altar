import type { Evento, Live } from '@/lib/types'

export type Papel = 'admin' | 'editor'

export type Usuario = {
  id: number
  nome: string
  email: string
  papel: Papel
  ativo?: boolean
  criado_em?: string
  ultimo_login?: string | null
}

export type Mensagem = {
  id: number
  tipo: 'contato' | 'oracao'
  nome: string | null
  email: string | null
  assunto: string | null
  texto: string
  publico: boolean
  lida: boolean
  criado_em: string
}

export type Resumo = {
  mensagens_nao_lidas: { contato: number; oracao: number }
  total_lives: number
  ultima_live: Live | null
  proxima_live: Live | null
  proximo_evento: Evento | null
}

export type OEmbed = {
  titulo: string | null
  plataforma: Live['plataforma']
  video_id: string | null
  thumbnail_url: string | null
}
