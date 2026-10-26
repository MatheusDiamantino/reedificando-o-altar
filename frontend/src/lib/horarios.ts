import type { Horario } from './types'

const DIAS: Horario['dia'][] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
export const NOME_DIA: Record<Horario['dia'], string> = {
  domingo: 'Domingo',
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
}

const OFFSET_BRASILIA_MS = -3 * 60 * 60 * 1000

function agoraEmBrasilia(agora: Date) {
  return new Date(agora.getTime() + OFFSET_BRASILIA_MS)
}

function emMinutos(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export type ProximoCulto = {
  horario: Horario
  inicio: Date
  acontecendoAgora: boolean
}

export function proximoCulto(horarios: Horario[], agora = new Date()): ProximoCulto | null {
  if (horarios.length === 0) return null
  const br = agoraEmBrasilia(agora)
  const hojeIdx = br.getUTCDay()
  const minutosAgora = br.getUTCHours() * 60 + br.getUTCMinutes()

  let melhor: ProximoCulto | null = null
  for (const h of horarios) {
    const diaIdx = DIAS.indexOf(h.dia)
    let diasAte = (diaIdx - hojeIdx + 7) % 7
    const acontecendoAgora = diasAte === 0 && minutosAgora >= emMinutos(h.inicio) && minutosAgora < emMinutos(h.fim)
    if (diasAte === 0 && minutosAgora >= emMinutos(h.fim)) diasAte = 7

    const inicioBr =
      Date.UTC(br.getUTCFullYear(), br.getUTCMonth(), br.getUTCDate() + diasAte) + emMinutos(h.inicio) * 60_000
    const inicio = new Date(inicioBr - OFFSET_BRASILIA_MS)
    const candidato = { horario: h, inicio, acontecendoAgora }

    if (acontecendoAgora) return candidato
    if (!melhor || inicio < melhor.inicio) melhor = candidato
  }
  return melhor
}

export function formatarHora(hhmm: string) {
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}
