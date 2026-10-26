const FUSO = 'America/Sao_Paulo'

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function hojeIso() {
  return new Date().toLocaleDateString('en-CA', { timeZone: FUSO })
}

export function isoDe(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export function diasNoMes(ano: number, mes: number) {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
}

export function diaDaSemana(iso: string) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay()
}

export function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function partesDaData(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`)
  return {
    dia: String(d.getUTCDate()).padStart(2, '0'),
    mes: MESES[d.getUTCMonth()].slice(0, 3).toLowerCase(),
    mesLongo: MESES[d.getUTCMonth()],
    ano: d.getUTCFullYear(),
    semana: d.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' }),
  }
}
