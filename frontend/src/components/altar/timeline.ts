export const PEDRAS = 12
export const INICIO_MONTAGEM = 0.1
export const FIM_MONTAGEM = 0.76
const DURACAO_PEDRA = 0.1

export const FOGO_DESCE = 0.775
export const IMPACTO = 0.795
export const FOGO_ACESO = 0.86

export const FILEIRAS = [5, 4, 3]

export type Faixa = readonly [inicio: number, fim: number]

export function janelaDaPedra(i: number): Faixa {
  const passo = (FIM_MONTAGEM - INICIO_MONTAGEM - DURACAO_PEDRA) / (PEDRAS - 1)
  const inicio = INICIO_MONTAGEM + i * passo
  return [inicio, inicio + DURACAO_PEDRA]
}

export function pedrasColocadas(p: number) {
  let n = 0
  for (let i = 0; i < PEDRAS; i++) if (p >= janelaDaPedra(i)[1]) n++
  return n
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function progressoEm([a, b]: Faixa, p: number) {
  return clamp01((p - a) / (b - a))
}

export function suave(a: number, b: number, v: number) {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function opacidadeNaFaixa([a, b]: Faixa, p: number, transicao = 0.025) {
  if (p < a - transicao || p > b + transicao) return 0
  return Math.min(suave(a - transicao, a + transicao, p), 1 - suave(b - transicao, b + transicao, p))
}

export function lugarDaPedra(i: number) {
  let resto = i
  for (let fileira = 0; fileira < FILEIRAS.length; fileira++) {
    if (resto < FILEIRAS[fileira]) return { fileira, indice: resto, total: FILEIRAS[fileira] }
    resto -= FILEIRAS[fileira]
  }
  throw new Error(`Pedra ${i} fora do altar`)
}

export function aleatorio(semente: number) {
  let s = semente
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
