import { useState } from 'react'
import { useConteudo } from '@/lib/queries'
import { Cabecalho } from '../../ui/Cabecalho'
import { AbaEndereco } from './AbaEndereco'
import { AbaHistoria } from './AbaHistoria'
import { AbaHorarios } from './AbaHorarios'
import { AbaLideres } from './AbaLideres'
import { AbaTextos } from './AbaTextos'

const ABAS = [
  { id: 'horarios', rotulo: 'Horários', Componente: AbaHorarios },
  { id: 'endereco', rotulo: 'Endereço e redes', Componente: AbaEndereco },
  { id: 'textos', rotulo: 'Textos', Componente: AbaTextos },
  { id: 'lideres', rotulo: 'Líderes', Componente: AbaLideres },
  { id: 'historia', rotulo: 'História', Componente: AbaHistoria },
] as const

export function ConteudoPage() {
  const [aba, setAba] = useState<(typeof ABAS)[number]['id']>('horarios')
  const { data: conteudo, isPlaceholderData } = useConteudo()
  const atual = ABAS.find((a) => a.id === aba)!

  return (
    <>
      <Cabecalho titulo="Conteúdo do site" descricao="Tudo o que você mudar aqui aparece no site na hora." />
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              aba === a.id ? 'bg-gold text-ink' : 'border border-paper/15 text-paper/70 hover:border-gold/50'
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {conteudo && !isPlaceholderData ? (
        <div className="max-w-3xl">
          <atual.Componente conteudo={conteudo} />
        </div>
      ) : (
        <p className="text-paper/60">Carregando…</p>
      )}
    </>
  )
}
