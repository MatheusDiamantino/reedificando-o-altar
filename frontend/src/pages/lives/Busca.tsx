type Props = { valor: string; aoMudar: (v: string) => void; total: number; carregando: boolean }

export function Busca({ valor, aoMudar, total, carregando }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-paper/10 pb-6">
      <label className="group relative flex w-full max-w-md items-center gap-4">
        <svg
          viewBox="0 0 24 24"
          className="size-6 shrink-0 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="sr-only">Buscar live pelo título</span>
        <input
          type="search"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="Buscar pelo título…"
          className="w-full bg-transparent font-display text-2xl text-paper placeholder:text-paper/30 focus:outline-none sm:text-3xl"
        />
      </label>
      <p className="text-xs tracking-[0.25em] text-ash uppercase" aria-live="polite">
        {carregando ? 'Carregando…' : `${total} ${total === 1 ? 'live' : 'lives'}`}
      </p>
    </div>
  )
}
