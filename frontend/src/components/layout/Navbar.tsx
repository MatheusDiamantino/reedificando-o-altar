import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useConteudo } from '@/lib/queries'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { Logo } from '@/components/ui/Logo'
import { useLenis } from '@/hooks/useLenis'
import { PAGINAS } from '@/lib/navegacao'

export function Navbar() {
  const [aberto, setAberto] = useState(false)
  const [rolou, setRolou] = useState(false)
  const { pathname } = useLocation()
  const lenis = useLenis()
  const { data: conteudo } = useConteudo()

  useEffect(() => setAberto(false), [pathname])

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (aberto) lenis?.stop()
    else lenis?.start()
    document.body.style.overflow = aberto ? 'hidden' : ''
  }, [aberto, lenis])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          rolou && !aberto ? 'bg-ink/70 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Página inicial">
            <Logo className="size-10" />
            <span className="hidden font-display text-sm leading-tight tracking-wider sm:block">
              Reedificando
              <br />
              <span className="text-gold">o Altar</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LiveBadge />
            <button
              type="button"
              onClick={() => setAberto((a) => !a)}
              className="group flex items-center gap-3 text-xs font-semibold tracking-[0.3em] uppercase"
              aria-expanded={aberto}
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              aria-controls="menu-principal"
            >
              <span className="hidden sm:inline">{aberto ? 'Fechar' : 'Menu'}</span>
              <span className="relative block h-3 w-8">
                <span
                  className={`absolute left-0 h-0.5 w-full bg-gold transition-transform duration-500 ease-altar ${
                    aberto ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 bg-gold transition-all duration-500 ease-altar ${
                    aberto ? 'top-1.5 w-full -rotate-45' : 'top-2.5 w-2/3 group-hover:w-full'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            id="menu-principal"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink"
            initial={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.25rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 3rem) 2.25rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.25rem)' }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="pointer-events-none absolute -bottom-1/3 left-1/2 size-[80vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_208_0/0.18),transparent_60%)]" />

            <ul className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-1 px-4 pt-24 pb-8 sm:px-8">
              {PAGINAS.map((p, i) => (
                <motion.li
                  key={p.to}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={p.to}
                    className={({ isActive }) =>
                      `group flex items-baseline gap-4 py-1 font-display text-[clamp(2.25rem,8vw,5.5rem)] leading-none font-semibold transition-colors ${
                        isActive ? 'text-gold' : 'text-paper hover:text-gold'
                      }`
                    }
                  >
                    <span className="font-sans text-xs tracking-widest text-ash">{p.numero}</span>
                    <span className="transition-transform duration-500 ease-altar group-hover:translate-x-4">
                      {p.label}
                    </span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="relative mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-4 border-t border-paper/10 px-4 py-6 text-sm text-ash sm:px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span>
                {conteudo?.endereco.rua}, {conteudo?.endereco.cidade}/{conteudo?.endereco.uf}
              </span>
              <span className="flex gap-6">
                <a href={conteudo?.redes.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Instagram
                </a>
                <a href={conteudo?.redes.facebook_grupo} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Facebook
                </a>
              </span>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
