import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type Base = { rotulo: string; erro?: string }

const estilo =
  'peer block w-full rounded-none border-0 border-b border-paper/20 bg-transparent px-0 pt-6 pb-2 text-paper placeholder-transparent transition-colors focus:border-gold focus:ring-0 focus:outline-none aria-invalid:border-red-400'

const rotuloEstilo =
  'pointer-events-none absolute top-6 left-0 text-paper/50 transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:text-gold peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:uppercase'

export function Campo({ rotulo, erro, id, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const campoId = id ?? props.name
  return (
    <div className="relative">
      <input id={campoId} placeholder=" " aria-invalid={!!erro} className={estilo} {...props} />
      <label htmlFor={campoId} className={rotuloEstilo}>
        {rotulo}
      </label>
      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </div>
  )
}

export function AreaDeTexto({ rotulo, erro, id, ...props }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const campoId = id ?? props.name
  return (
    <div className="relative">
      <textarea id={campoId} placeholder=" " aria-invalid={!!erro} className={`${estilo} resize-none`} {...props} />
      <label htmlFor={campoId} className={rotuloEstilo}>
        {rotulo}
      </label>
      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </div>
  )
}

export function Armadilha() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Não preencha
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
