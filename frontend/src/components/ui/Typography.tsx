import type { ReactNode } from 'react'

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-semibold tracking-[0.35em] text-gold uppercase ${className}`}>{children}</p>
}

export function GoldText({ children }: { children: ReactNode }) {
  return (
    <span className="animate-gold-shine bg-linear-[100deg] from-gold-pale via-gold to-gold-pale bg-size-[200%_100%] bg-clip-text text-transparent motion-reduce:animate-none">
      {children}
    </span>
  )
}

export const glow = 'text-shadow-[0_0_24px_rgb(255_208_0/0.45),0_0_64px_rgb(255_208_0/0.2)]'
