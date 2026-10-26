import { Link } from 'react-router-dom'
import { formatarHora, NOME_DIA } from '@/lib/horarios'
import { useConteudo } from '@/lib/queries'
import { Logo } from '@/components/ui/Logo'
import { Eyebrow } from '@/components/ui/Typography'
import { PAGINAS } from '@/lib/navegacao'

export function Footer() {
  const { data: c } = useConteudo()
  if (!c) return null

  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="mb-6 size-14" vivo={false} />
          <p className="max-w-xs font-display text-2xl leading-snug">
            Sua vida no <span className="text-gold">altar de Deus</span>.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <Eyebrow className="mb-4">Venha nos visitar</Eyebrow>
          <p>
            {c.endereco.rua}
            <br />
            {c.endereco.cidade}/{c.endereco.uf}
          </p>
          {c.horarios.map((h) => (
            <p key={h.dia + h.inicio} className="text-ash">
              {NOME_DIA[h.dia]}, {formatarHora(h.inicio)} às {formatarHora(h.fim)}
            </p>
          ))}
          <a href={`mailto:${c.email}`} className="block break-all text-ash hover:text-gold">
            {c.email}
          </a>
        </div>

        <nav className="text-sm" aria-label="Rodapé">
          <Eyebrow className="mb-4">Navegue</Eyebrow>
          <ul className="grid grid-cols-2 gap-2">
            {PAGINAS.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="hover:text-gold">
                  {p.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={c.redes.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                Instagram
              </a>
            </li>
            <li>
              <a href={c.redes.facebook_grupo} target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div
        aria-hidden
        data-texto="REEDIFICANDO"
        className="pointer-events-none -mb-[0.22em] text-center font-display text-[clamp(3rem,11.5vw,11rem)] leading-none font-black whitespace-nowrap text-paper/[0.04] select-none before:content-[attr(data-texto)]"
      />
      <div className="border-t border-paper/10 py-5 text-center text-xs text-ash">
        © {new Date().getFullYear()} Ministério Reedificando o Altar · Pastor Doze
      </div>
    </footer>
  )
}
