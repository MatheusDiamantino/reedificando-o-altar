import type { ReactNode } from 'react'

export function Cabecalho({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{titulo}</h1>
        {descricao && <p className="mt-2 text-paper/60">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-paper/15 px-6 py-16 text-center text-paper/60">
      {children}
    </div>
  )
}
