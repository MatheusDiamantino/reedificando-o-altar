import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-xl border border-paper/10 bg-ink px-4 py-3 text-paper placeholder:text-paper/30 transition focus:border-gold/70 focus:ring-2 focus:ring-gold/20 focus:outline-none aria-invalid:border-red-400'

type Rotulado = { rotulo: string; erro?: string; dica?: ReactNode }

function Envolto({ rotulo, erro, dica, children }: Rotulado & { children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold tracking-[0.15em] text-paper/60 uppercase">{rotulo}</span>
      {children}
      {erro ? (
        <span className="block text-sm text-red-400">{erro}</span>
      ) : (
        dica && <span className="block text-sm text-ash">{dica}</span>
      )}
    </label>
  )
}

export function Entrada({ rotulo, erro, dica, ...props }: Rotulado & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Envolto rotulo={rotulo} erro={erro} dica={dica}>
      <input aria-invalid={!!erro} className={base} {...props} />
    </Envolto>
  )
}

export function Texto({ rotulo, erro, dica, ...props }: Rotulado & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Envolto rotulo={rotulo} erro={erro} dica={dica}>
      <textarea aria-invalid={!!erro} className={`${base} min-h-28 resize-y`} {...props} />
    </Envolto>
  )
}

export function Selecao({
  rotulo,
  erro,
  dica,
  children,
  ...props
}: Rotulado & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Envolto rotulo={rotulo} erro={erro} dica={dica}>
      <select aria-invalid={!!erro} className={`${base} appearance-none`} {...props}>
        {children}
      </select>
    </Envolto>
  )
}

export function Alternador({
  rotulo,
  descricao,
  ligado,
  aoMudar,
}: {
  rotulo: string
  descricao?: string
  ligado: boolean
  aoMudar: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => aoMudar(!ligado)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-paper/10 bg-ink px-4 py-3 text-left transition hover:border-paper/25"
    >
      <span>
        <span className="block font-medium">{rotulo}</span>
        {descricao && <span className="block text-sm text-ash">{descricao}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${ligado ? 'bg-gold' : 'bg-paper/15'}`}>
        <span
          className={`absolute top-1 size-4 rounded-full transition-all ${ligado ? 'left-6 bg-ink' : 'left-1 bg-paper/70'}`}
        />
      </span>
    </button>
  )
}
