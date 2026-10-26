export const noNavegador = typeof window !== 'undefined'

let preRenderizado = noNavegador && !!document.getElementById('root')?.firstElementChild

export function entradaJaAnimada() {
  return preRenderizado && performance.now() > 1200
}

export function encerrarPreRender() {
  preRenderizado = false
}
