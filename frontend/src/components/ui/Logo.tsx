import { useId } from 'react'

type Props = {
  className?: string
  vivo?: boolean
}

export function Logo({ className, vivo = true }: Props) {
  const gradiente = `logo-chama-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Ministério Reedificando o Altar">
      <defs>
        <linearGradient id={gradiente} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c99a00" />
          <stop offset="0.55" stopColor="#ffd000" />
          <stop offset="1" stopColor="#ffff00" />
        </linearGradient>
      </defs>
      <path
        d="M33 6c4 8-3 12-1 19 2-3 5-4 6-8 5 7 4 16-2 21-2 2-5 3-8 3 3-3 4-8 1-11-2 3-5 5-6 9-4-6 0-12 4-16-2-6 2-12 6-17z"
        fill={`url(#${gradiente})`}
        className={vivo ? 'origin-[32px_42px] animate-flicker motion-reduce:animate-none' : undefined}
      />
      <path d="M9 32c15 9 31 9 46 0v24H9z" fill="none" stroke="#ffd000" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}
