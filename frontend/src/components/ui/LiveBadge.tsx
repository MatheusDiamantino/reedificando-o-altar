import { Link } from 'react-router-dom'
import { useLiveAtual } from '@/lib/queries'

export function LiveBadge() {
  const { data: live } = useLiveAtual()
  if (!live) return null

  return (
    <Link
      to="/lives"
      className="flex animate-live-pulse items-center gap-2 rounded-full bg-ember px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase"
      aria-label={`Ao vivo agora: ${live.titulo}`}
    >
      <span className="size-2 rounded-full bg-red-600" />
      Ao vivo
    </Link>
  )
}
