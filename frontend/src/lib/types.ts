export type Live = {
  id: number
  titulo: string
  descricao: string
  link: string
  plataforma: 'youtube' | 'facebook' | 'outro'
  video_id: string | null
  thumbnail_url: string | null
  data_live: string
  ao_vivo: boolean
  destaque: boolean
}

export type Evento = {
  id: number
  titulo: string
  descricao: string
  data: string
  hora: string | null
  local: string | null
  recorrencia: 'semanal' | 'mensal' | null
}

export type Horario = {
  dia: 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado'
  inicio: string
  fim: string
  nome: string
}

export type Textos = {
  convite_culto: { titulo: string; subtitulo: string }
  boas_vindas: { titulo: string; paragrafos: string[] }
  chamado: { pergunta: string; titulo: string; subtitulo: string; texto: string }
  amos_9_11: { referencia: string; texto: string }
  contato_intro: string
}

export type Redes = { facebook_grupo: string; facebook: string; instagram: string; whatsapp: string }

export type Lider = { nome: string; cargo: string; foto: string }

export type Marco = { ano: string; titulo: string; texto?: string }

export type Conteudo = {
  lideres: Lider[]
  historia: Marco[]
  horarios: Horario[]
  endereco: { rua: string; cidade: string; uf: string; maps_url: string; lat: number; lng: number }
  redes: Redes
  email: string
  textos: Textos
}
