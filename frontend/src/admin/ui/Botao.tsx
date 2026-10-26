import type { ButtonHTMLAttributes } from 'react'

type Variante = 'ouro' | 'contorno' | 'fantasma' | 'perigo'

const estilos: Record<Variante, string> = {
  ouro: 'bg-gold text-ink hover:shadow-[0_0_30px_rgb(255_208_0/0.4)]',
  contorno: 'border border-paper/15 text-paper hover:border-gold/60 hover:text-gold',
  fantasma: 'text-paper/70 hover:bg-paper/5 hover:text-paper',
  perigo: 'border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-paper',
}

export function Botao({
  variante = 'ouro',
  carregando = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    >
      {carregando && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
