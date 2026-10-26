import { useState } from 'react'
import type { Textos } from '@/lib/types'
import { Entrada, Texto } from '../../ui/Formulario'
import { BotaoSalvar, useSalvarAba, type AbaProps } from './Salvar'

export function AbaTextos({ conteudo }: AbaProps) {
  const [t, setT] = useState<Textos>(conteudo.textos)
  const { executar, salvando } = useSalvarAba()
  const mudar = <K extends keyof Textos>(chave: K, valor: Partial<Textos[K]>) =>
    setT((atual) => ({ ...atual, [chave]: { ...(atual[chave] as object), ...valor } }))

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Boas-vindas (página inicial)</h2>
        <Texto
          rotulo="Parágrafos"
          rows={8}
          value={t.boas_vindas.paragrafos.join('\n\n')}
          onChange={(e) => mudar('boas_vindas', { paragrafos: e.target.value.split(/\n\s*\n/) })}
          dica="Deixe uma linha em branco entre um parágrafo e outro."
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Nosso chamado (página Sobre)</h2>
        <Entrada
          rotulo="Pergunta"
          value={t.chamado.pergunta}
          onChange={(e) => mudar('chamado', { pergunta: e.target.value })}
        />
        <Entrada
          rotulo="Título"
          value={t.chamado.titulo}
          onChange={(e) => mudar('chamado', { titulo: e.target.value })}
        />
        <Entrada
          rotulo="Subtítulo"
          value={t.chamado.subtitulo}
          onChange={(e) => mudar('chamado', { subtitulo: e.target.value })}
        />
        <Texto
          rotulo="Texto"
          rows={8}
          value={t.chamado.texto}
          onChange={(e) => mudar('chamado', { texto: e.target.value })}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Versículo da página Sobre</h2>
        <Entrada
          rotulo="Referência"
          value={t.amos_9_11.referencia}
          onChange={(e) => mudar('amos_9_11', { referencia: e.target.value })}
        />
        <Texto
          rotulo="Texto"
          rows={5}
          value={t.amos_9_11.texto}
          onChange={(e) => mudar('amos_9_11', { texto: e.target.value })}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Página de contato</h2>
        <Texto
          rotulo="Introdução"
          rows={3}
          value={t.contato_intro}
          onChange={(e) => setT({ ...t, contato_intro: e.target.value })}
        />
      </section>

      <BotaoSalvar
        salvando={salvando}
        onClick={() =>
          executar({
            textos: {
              ...t,
              boas_vindas: {
                ...t.boas_vindas,
                paragrafos: t.boas_vindas.paragrafos.map((p) => p.trim()).filter(Boolean),
              },
            },
          })
        }
      />
    </div>
  )
}
